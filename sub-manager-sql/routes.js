const express = require('express');
const router = express.Router();
const Subscription = require('./models/Subscription');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Please log in' });
};

router.get('/', isAuthenticated, async(req,res) =>{
    try {
        const subs = await Subscription.findAll({
            where: { userEmail: req.user.emails[0].value }
        });
        res.json(subs);
    } catch(err) {
        res.status(500).json({error:err.message });
    }
});

router.post('/', isAuthenticated, async(req,res) => {
    try {
        const{ serviceName, cost, billingCycle, startDate } = req.body;
        let nextDate = new Date(startDate);

        if(billingCycle === 'MONTHLY'){
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        const newSub = await Subscription.create({
            serviceName, cost, billingCycle, startDate, 
            nextRenewalDate: nextDate,
            userEmail: req.user.emails[0].value 
        });
        res.status(201).json(newSub);
    } catch(err) {
        res.status(400).json({error:err.message});
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const deleted = await Subscription.destroy({
            where: { 
                id: req.params.id,
                userEmail: req.user.emails[0].value 
            }
        });
        if (deleted) res.json({ message: 'Deleted' });
        else res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;