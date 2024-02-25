const fastify = require('fastify')({
  logger: true
});
const fs = require('fs');
require('dotenv').config({silent: true});
const jwt = require('jsonwebtoken');
const dbPath = "DB/users.json";
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

let DB = {
    products: [
        {
            id: 1,
            name: "Ball",
            description: "Object to play soccer",
            price: 130,
            availability: true
        }
    ]
};

const verifyJWT = (request, reply, next) => {
    const token = request.headers['authorization'];
    if (!token) return reply.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
      if (err) return reply.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
        
    request.userId = decoded.id; 
    next();
    });
}

const uniqueID = () => {
    return Math.floor(Math.random() * Date.now())
}

fastify.post('/api/login', (request, reply) => {
    let login = request.body.login;
    let password = request.body.password;

    for (let index = 0; index < db.length; index++) {
      if (db[index].login == login && db[index].password == password) {
        const id = db[index].id;  
        const token = jwt.sign({ id }, process.env.PRIVATE_KEY, {
          expiresIn: 3600 // expires in 60min
        });
        return reply.send({ auth: true, token: token });
      }
  }
      reply.status(400).send({message: 'Login not valid!'});
  })

fastify.get('/api/products', (request, reply) => {
    reply.send(DB.products);
})

fastify.post('/api/products', (request, reply) => {
    let {name, description, price, availability} = request.body;
    DB.products.push({
        id: uniqueID(),
        name: name,
        description: description,
        price: price,
        availability: availability
    });
    reply.status(200);
    reply.send("Your product was add in database!");
})

fastify.get('/api/products/:id', (request, reply) => {
    let id = parseInt(request.params.id);
    var product = DB.products.find(elem => elem.id == id);
    if(product == undefined)
    {
        reply.status(404);
        reply.send("Id was not found");
    }
    reply.status(200);
    reply.send(product);
})

fastify.put('/api/products/:id', (request, reply) => {
    if(isNaN(request.params.id))
    {
        reply.status(400);
        reply.send("Id is not a number");
    } 
    let id = parseInt(request.params.id);
    var product = DB.products.find(elem => elem.id == id);
    if(product != undefined)
    {
        let {name, description, price, availability} = request.body;
        if(name != undefined)
        {
            product.name = name;
        }
        if(description != undefined)
        {
            product.description = description;
        }
        if(price != undefined)
        {
            product.price = price;
        }
        if(availability != undefined)
        {
            availability.year = availability;
        }
        reply.status(200);
        reply.send("Your product was changed in database!");
    } 
    else 
    {
        reply.status(404);
        reply.send("Id was not found");
    }
    
})

fastify.delete('/api/products/:id', (request, reply) => {
    if(isNaN(request.params.id))
    {
        reply.status(400);
        reply.send("Id is not a number");
    }
    else
    {
        let id = parseInt(request.params.id);
        var index = DB.products.findIndex(elem => elem.id == id);

        if(index == -1){
            reply.status(404);
            reply.send("Id was not found");
        } else {
            DB.products.splice(index, 1);
            reply.status(200);
            reply.send("Your product was delete in database!");
        }
    }
})


fastify.get('/api/posts', { preHandler: [verifyJWT] }, (request, reply) => {
    return reply.status(200).send(DB.products);
})

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})