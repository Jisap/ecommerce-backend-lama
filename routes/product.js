const Product = require('../models/Product');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

const router = require('express').Router();

//CREATE PRODUCT
router.post("/", verifyTokenAndAdmin, async( req, res ) => {
    const newProduct = new Product( req.body );
    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(
            savedProduct
        )
    } catch (err) {
        res.status(500).json(err)
    }
})

//PUT PRODUCT
router.put("/:id", verifyTokenAndAdmin, async( req, res ) => {                                // Ruta de actualización de un usuario

    try {
        const updatedProduct = await Product.findByIdAndUpdate( req.params.id, {  // Buscamos un product en Bd según id de los params
            $set: req.body                                                        // le asignamos en bd el body con los cambios 
        }, { new: true } )                                                        // y le decimos a mongo que actualize al instante
    
        res.status( 200 ).json( updatedProduct )
    
    } catch (err) {
        res.status( 500 ).json( err ); 
    }
})

//DELETE PRODUCT
router.delete("/:id", verifyTokenAndAdmin, async( req, res ) => {
    try {
        await Product.findByIdAndDelete( req.params.id );                  // Busca el producto por id y lo borra
        res.status( 200 ).json({                                           // Mensaje de borrado
            ok:true,
            msg:"Product has been deleted"
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

// //GET PRODUCT
router.get("/find/:id", async( req, res ) => {
    try {
        const product = await Product.findById( req.params.id );              // Busca un producto por id
        res.status( 200 ).json(                                              // Damos la respuesta 
            product
        )
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

//GET ALL PRODUCTS
router.get("/", async( req, res ) => {

    const qNew = req.query.new;                 //Definimos el query si lo hay. localhost:5000/api/products?new=true                               
    const qCategory = req.query.category;       // localhost:5000/api/products?category=man
    try {

        let products;
        if(qNew){                                                           // Si el qNew existe
            products = await Product.find().sort({createdAt: -1}).limit(5)  // Buscamos los 5 últimos productos creados empezando por el final
        }else if(qCategory){                                                // Sino existe el qNew miramos si existe el qCategory y si es así
            products = await Product.find({                                 // buscamos en bd los productos que contengan esa qCategory
                categories:{
                    $in: [qCategory],
                },
            });
        }else{                                                              // Sino hay ninguna query
            products = await Product.find();                                // Mostramos todos los productos
        }

        res.status( 200 ).json(                                    
            products
        )

    } catch (err) {
        res.status( 500 ).json(
            err
        )
    }
});



module.exports = router