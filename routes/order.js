const router = require("express").Router();
const Order = require('../models/Order');

const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

//CREATE ORDER
router.post("/", verifyToken, async( req, res ) => { // Cualquier usuario podrá hacer una orden de compra
    const newOrder = new Order( req.body );
    try {
        const savedOrder = await newOrder.save();
        res.status(200).json({
            ok:true,
            savedOrder
        })
    } catch (err) {
        res.status(500).json(err)
    }
})

//PUT ORDER
router.put("/:id", verifyTokenAndAdmin, async( req, res ) => {                    // Ruta de actualización de una orden de compra, 
                                                                                  // solo el admin podrá modificarla.
    try {
        const updatedOrder = await Order.findByIdAndUpdate( req.params.id, {      // Buscamos una orden en Bd según id de los params
            $set: req.body                                                        // le asignamos en bd el body con los cambios 
        }, { new: true } )                                                        // y le decimos a mongo que actualize al instante
    
        res.status( 200 ).json( updatedOrder )
    
    } catch (err) {
        res.status( 500 ).json( err ); 
    }
})

//DELETE ORDER
router.delete("/:id", verifyTokenAndAdmin, async( req, res ) => {
    try {
        await Order.findByIdAndDelete( req.params.id );                     // Busca el producto por id y lo borra
        res.status( 200 ).json({                                            // Mensaje de borrado
            ok:true,
            msg:"Order has been deleted"
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

// GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuthorization, async( req, res ) => {
    try {
        const orders = await Order.find( { userId:req.params.userId } );   // Busca una orden por la userId, los users solo pueden hacer una orden a la vez
        res.status( 200 ).json({                                           // Damos la respuesta
            ok:true,
            orders
        })
    } catch (err) {
        res.status( 500 ).json( err )
    }
});

//GET ALL
router.get("/", verifyTokenAndAdmin, async( req, res ) => {
    try {
        const orders = await Order.find();
        res.status(200).json({
            orders
        });
    } catch (err) {
        resizeTo.status(500).json(err)
    }
})

// GET MONTHLY INCOME / INGRESOS POR MES ACTUAL Y PREVIO
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;                                                  // El id del producto podría ir en el req
  const date = new Date();                                                          // Fecha actual
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));                   // Último mes 
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));    // Fecha desde el Mes previo al último (2 meses desde la fecha actual)

  try {
    const income = await Order.aggregate([
                                                                           // Condición de busqueda en bd "Order"                
      { $match: { createdAt: { $gte: previousMonth }, ...(productId && {   // Buscar en el mes anterior y si el query productId existe
          products:{ $elemMatch: { productId }}                            // buscar las coincidencias según ese query 
      }) } },   
      {
        $project: {                                         // Establezco las variables a sumar de Order
          month: { $month: "$createdAt" },                  // Mes lo establezco según createdAt de mongo
          sales: "$amount",                                 // Ventas según cantidad/amount
        },
      },
      {
        $group: {                                           // Rdo final
          _id: "$month",                                    // encada mes
          total: { $sum: "$sales" },                        // sumamos el total de ventas
        },
      },
    ]);
    res.status(200).json({
        income
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;