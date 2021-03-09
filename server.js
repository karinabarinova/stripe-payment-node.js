if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
const stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const express = require('express')
const app = express();
const fs = require('fs');
const { request } = require('http');
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static('public'))
app.get('/store', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error)
            res.status(500).end()
        else {
            res.render('store.ejs', {
                items: JSON.parse(data),
                stripePublicKey
            })
        }
    })
})

app.post('/purchase', (req, res) => {
    fs.readFile('items.json', (error, data) => {
        if (error)
            res.status(500).end()
        else {
            const itemsJson = JSON.parse(data)
            const itemsArray = itemsJson.music.concat(itemsJson.merch)
            let total = 0;
            req.body.items.forEach(item => {
                const itemJson = itemsArray.find((i) => {
                    return i.id == item.id
                })
                total = total + itemJson.price * item.quantity
            })

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(() => {
                console.log("success")
                res.json({message: 'Successfully purchased items'})
            }).catch(e => {
                console.log("fail")
                res.status(500).end()
            })
        }
    })
})

app.listen(3000, () => {
    console.log("server started")
})