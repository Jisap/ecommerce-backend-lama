const router = require("express").Router();
const Cart = require('../models/Cart');

const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

//CREATE CART
router.post("/", verifyToken, async( req, res ) => { // Cualquier usuario podrá crear un carrito de compra
    const newCart = new Cart( req.body );
    try {
        const savedCart = await newCart.save();
        res.status(200).json({
            ok:true,
            savedCart
        })
    } catch (err) {
        res.status(500).json(err)
    }
})

//PUT CART
router.put("/:id", verifyTokenAndAuthorization, async( req, res ) => {            // Ruta de actualización de un carrito, 
                                                                                  // solo el user logueado podrá modificarlo.
    try {
        const updatedCart = await Cart.findByIdAndUpdate( req.params.id, {        // Buscamos un cart en Bd según id de los params
            $set: req.body                                                        // le asignamos en bd el body con los cambios 
        }, { new: true } )                                                        // y le decimos a mongo que actualize al instante
    
        res.status( 200 ).json( updatedCart )
    
    } catch (err) {
        res.status( 500 ).json( err ); 
    }
})

//DELETE CART
router.delete("/:id", verifyTokenAndAuthorization, async( req, res ) => {
    try {
        await Cart.findByIdAndDelete( req.params.id );                  // Busca el producto por id y lo borra
        res.status( 200 ).json({                                           // Mensaje de borrado
            ok:true,
            msg:"Cart has been deleted"
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

// GET USER CART
router.get("/find/:userId", verifyTokenAndAuthorization, async( req, res ) => {
    try {
        const cart = await Cart.findOne( { userId:req.params.userId } );   // Busca un carrito por la userId, este usuario es el creador del carrito
        res.status( 200 ).json({                                           // Damos la respuesta
            ok:true,
            cart
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

//GET ALL
router.get("/", verifyTokenAndAdmin, async( req, res ) => {
    try {
        const carts = await Cart.find();
        res.status(200).json({
            ok:true,
            carts
        });
    } catch (err) {
        resizeTo.status(500).json(err)
    }
})

module.exports = router;