const User = require('../models/User');
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

const router = require('express').Router();

//PUT
router.put("/:id", verifyTokenAndAuthorization, async( req, res ) => {                                // Ruta de actualización de un usuario

    if(req.body.password){                                                                            // Si la pass cambio y va en el body...
        req.body.password = CryptoJS.AES.encrypt( req.body.password, process.env.PASS_SEC).toString() // la encryptamos de nuevo.
    }

    try {
        const updatedUser = await User.findByIdAndUpdate( req.params.id, {  // Buscamos al usuario en Bd según id de los params
            $set: req.body                                                  // le asignamos el body con los cambios 
        }, { new: true } )                                                  // y le decimos a mongo que actualize al instante
    
        res.status( 200 ).json( updatedUser )
    
    } catch (err) {
        res.status( 500 ).json( err ); 
    }
})

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async( req, res ) => {
    try {
        await User.findByIdAndDelete( req.params.id );                  // Busca el usuario por id y lo borra
        res.status( 200 ).json({                                        // Mensaje de borrado
            ok:true,
            msg:"User has been deleted"
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async( req, res ) => {
    try {
        const user = await User.findById( req.params.id );              // Busca un usuario por id
        const { password, ...others } = user._doc;                      // Le sacamos el password
        res.status( 200 ).json({                                        // Damos la respuesta
            ok:true,
            others
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

//GET ALL USERS
router.get("/", verifyTokenAndAdmin, async( req, res ) => {
    const query = req.query.new;                                    //Definimos el query si lo hay. localhost:5000/api/users/?new=true
    console.log(query)
    try {
        const users = query                                         // Busca todos los usuario de la bd según un ternario
            ? await User.find().sort({_id:-1}).limit(5)             // Si existe el query muestra rdos ordenados desde el final limitados a 5 
            : await User.find();                                    // Si no existe el query semuestran todos los usuarios de la bd
        res.status( 200 ).json({                                    
            users
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

//GET USERS STATS
router.get("/stats", verifyTokenAndAdmin, async( req, res ) => {
    const date = new Date();
    const lastYear = new Date( date.setFullYear(date.getFullYear() - 1))

    try {                                               // $match Filtra los documentos para pasar solo los documentos que coinciden 
        const data = await User.aggregate([             // con las condiciones especificadas a la siguiente etapa de canalización.
            { $match: { createdAt: { $gte: lastYear }}},// $gte selecciona los documentos donde el valor de field es  >= a un valor especificado
            {           //field                         // Todo esto es un filtro que busca los Users creados en año pasado
                $project:{
                    month:{ $month: "$createdAt" },       // Cada mes recogerá los users que se crearon en el.
                },
            },
            {
                $group:{                                // Agrupamos los datos
                    _id: "$month",                      // Segun un id = mes
                    total:{ $sum: 1 }                   // Cada mes contendra la suma de los usuarios de ese mes
                }
            } 
        ]);
        
        res.status(200).json({
            data
        })

    } catch (err) {
        res.status( 500 ).json(err)
    }
})

module.exports = router