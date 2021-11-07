const jwt = require("jsonwebtoken");

const verifyToken = ( req, res, next ) => {

    const authHeader = req.headers.token;                             // token que viene en los headers

    if(authHeader){                                                   // Si existe el token
        const token = authHeader.split(" ")[1];                       // lo definimos 
        jwt.verify( token, process.env.JWT_SEC,                       // verificamos su validez en base al jwt-secret
            ( err, user ) => {                                        // obtendremos una respuesta que podrá tener un err o un usuario
                if(err) res.status(403).json({                        // Si es un error -> mensaje  
                    ok:false,
                    msg: "Token is not valid"
                })    
                req.user = user;                                      // Si es un usuario se incoporará al req y asi en el router.user 
                next();                                               // se podrá continuar con su procesado ( Put, delete o lo que sea )
            })                                                        
    }else{
        return res.status(401).json({
            ok:false,
            msg:"You are not authenticated"
        })
    }
}

const verifyTokenAndAuthorization = ( req, res, next ) => {         // Estas funciones parten de un verifyToken que genera un usuario válidado
    verifyToken( req, res, () => {                                  // Se trata de ver si ese usuario es una admin o es el mismo que viene en los params
        if( req.user.id === req.params.id || req.user.isAdmin ){    // Solo se podrá modificar y borrar un usuario si es el mismo el que loguea 
            next();                                                 // o es un admin 
        }else{
            res.status(403).json({
                ok:false,
                msg:"You are not allowed to do that"
            })
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {                   // Solo el administrador podrá modificar productos y precios y buscar un usuario por id
  verifyToken(req, res, () => {                                     // Una vez que se verifica que el token es válido
    if (req.user.isAdmin) {                                         // se mira si el usuario es también administrador
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};



module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin }