const router = require('express').Router();
const User = require('../models/User');
//yarn add crypto-js
const CryptoJS = require('crypto-js')
//yarn add jsonwebtoken
const jwt = require('jsonwebtoken')

//REGISTER 
router.post("/register", async( req, res ) => { 

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt( req.body.password, process.env.PASS_SEC).toString(),
    });

    try {
        const savedUser = await newUser.save();
    
        res.status(200).json({
            ok:true,
            savedUser
        })
        
    }catch(err) {
        res.status(500).json({
            ok:false,
            err
        })
    }
})
    //LOGIN

router.post("/login", async ( req, res ) => { 
        
    try {
        const user = await User.findOne({ username: req.body.username });   // Buscamos un usuario en Bd que coincida con el del body

            !user && res.status(401).json({                                 // Comprobación 1ª
                ok:false,
                message: "Crendenciales erroneas"
            })

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);   // Desencriptación password
        const Originalpassword= hashedPassword.toString( CryptoJS.enc.Utf8 );               // Conversion a String con formato utf8

            Originalpassword !== req.body.password && res.status(401).json({    // Comprobación 2ª
                ok:false,
                message:"Credenciales erroneas"
            })

        const accessToken = jwt.sign(   // Creamos el jwt con las props que nos interesa que contenga y que nos serviran para controlar el acceso a la bd
            { id: user.id,
              isAdmin: user.isAdmin
            }, 
            process.env.JWT_SEC,
            {
              expiresIn:"3d"
            }
        )

        const { password, ...others } = user._doc;   // Sacamos la password del resultado para que no se muestre en la res y metemos el jwt

        res.status(200).json({
            ok:true,
            ...others,
            accessToken
        })

        } catch (err) {
            res.status(500).json({
                ok:false,
                err
            })
        }
 
})


module.exports = router