const express = require("express");
const ExpressError = require('../expressError')
const router = express.Router();
const db = require("../db")




router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT i.code, i.industry, c.name FROM industries AS i LEFT JOIN companyindustries AS ci ON i.code=ci.industry_code LEFT JOIN companies as c on c.code = ci.company_code `)

        return res.json(results.rows)
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body
        const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry])
        return res.status(201).json({ industry: results.rows })
    } catch (e) {
        return next(e)
    }
})

router.post('/link', async (req, res, next) => {
    try {
        const { company_code, industry_code } = req.body
        const results = await db.query(`INSERT INTO companyindustries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code`, [company_code, industry_code])
        return res.status(200).json({ msg: 'Created!' })
    } catch (e) {
        return next(e)
    }
})

module.exports = router;