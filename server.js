const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require('path');
const app = express();
const port = 3000;

// Cors configuration - Allows requests from localhost:4200
const corsOptions = {
  origin: "http://dtaquito-front-web.netlify.app/",
  optionsSuccessStatus: 204,
  methods: "GET, POST, PUT, DELETE",
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const multer = require('multer');

const upload = multer({ storage: storage });

// Use cors middleware
app.use(cors(corsOptions));

// Use express.json() middleware to parse JSON bodies of requests
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// GET route - Allows to get all the items
// example: localhost:3000/clothes?page=0&perPage=2
app.get("/items", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;
  const ownerId = req.query.ownerId;
  console.log('ownerId in GET /items:', ownerId); // Agregar esta línea

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    let items = jsonData.items;

    // Si se proporciona ownerId, filtrar los productos por ownerId
    if (ownerId) {
      items = items.filter(item => item.ownerId === ownerId);
    }

    const start = page * perPage;
    const end = start + perPage;

    const result = items.slice(start, end);

    res.status(200).json({
      items: result,
      total: items.length,
      page,
      perPage,
      totalPages: Math.ceil(items.length / perPage),
    });
  });
});

app.get("/reservations", (req, res) => {
  const rentorId = req.params.rentorId;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const userReservations = jsonData.reservations.filter(reservation => reservation.rentorId === rentorId);

    res.status(200).json(userReservations);
  });
});

// POST route - Allows to add a new item
// example: localhost:3000/clothes
/*
  body: {
    "image": "https://your-image-url.com/image.png",
    "name": "T-shirt",
    "price": "10",
    "rating": 4
  }
*/
// PUT route - Allows to update an item

// POST route - Allows to add a new item
// POST route - Allows to add a new item
app.post("/items", (req, res) => {
  const { image, name, price, rating } = req.body;
  console.log('req.body in POST /clothes:', req.body); // Agregar esta línea

  const ownerId = req.body.ownerId;
  console.log('ownerId in POST /clothes:', ownerId); // Agregar esta línea

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const maxId = jsonData.items.reduce(
      (max, item) => Math.max(max, item.id),
      0
    );

    const newItem = {
      id: maxId + 1,
      image,
      name,
      price,
      rating,
      ownerId, // Asignar ownerId al nuevo artículo
    };

    jsonData.items.push(newItem);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Devolver el artículo agregado
      res.status(201).json(newItem);
    });
  });
});

app.post("/reservations", (req, res) => {
  const newReservation = req.body;

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    jsonData.reservations.push(newReservation);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Return the newly added reservation
      res.status(201).json(newReservation);
    });
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  // req.file es el `image` file
  // req.body contendrá los campos de texto, si los hubiera
  res.status(201).json({ imageUrl: `http://localhost:3000/uploads/${req.file.filename}` });
});


// PUT route - Allows to update an item
app.put("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { image, name, price, rating, ownerId } = req.body;

  // Aquí podrías validar el ownerId para asegurarte de que el usuario esté autenticado y obtener su información de usuario.

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const index = jsonData.items.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }

    // Actualizar los datos del artículo, incluyendo ownerId
    jsonData.items[index] = {
      id,
      image,
      name,
      price,
      rating,
      ownerId,
    };

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Devolver el artículo actualizado junto con la información del propietario.
      res.status(200).json(jsonData.items[index]);
    });
  });
});

// DELETE route - Allows to delete an item
// example: localhost:3000/clothes/1
app.delete("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const jsonData = JSON.parse(data);

    const index = jsonData.items.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).send("Not Found");
      return;
    }

    jsonData.items.splice(index, 1);

    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(204).send();
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
