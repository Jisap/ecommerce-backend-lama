const router = require('express').Router();
// yarn add stripe
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/payment", ( req, res) => {   // api/checkout/payment
    

    stripe.charges.create(                    // Creamos un cargo al cliente
        {               
            source: req.body.tokenId,               // Stripe definirá una variable tokenId
            amount: req.body.amount,                // y una variable cantidad
            currency: "usd",                        // así como la moneda de pago
        }, 
        ( stripeErr, stripeRes ) => {               // CB con la res
            if( stripeErr ){
                res.status(500).json({
                    ok:false,
                    msg:console.log(JSON.stringify(stripeErr))
                })    
            }else{
                res.status(200).json({
                    ok:true,
                    msg:"Cargo realizado",
                    stripeRes
                })
            }
        })
         
})

module.exports = router