const express = require("express");
const ExpressError = require('../expressError')
const router = express.Router();
const db = require("../db")


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`)
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        return res.send({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
        return res.status(201).json({ invoice: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const { amt, paid } = req.body
        const invoice = await db.query(`SELECT amt FROM invoices WHERE id = $1`, [id])
        const date = (new Date()).toLocaleString("en-US")
        let results;
        if (paid === true) {
            console.log(Date())
            results = await db.query('UPDATE invoices SET amt=$1, paid_date=$2, paid=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, date, paid, id])
            return res.send({ company: results.rows[0] })
        } else if (amt < invoice.rows[0].amt) {
            results = await db.query('UPDATE invoices SET amt=$1, paid_date=$2, paid=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, null, paid, id])
            return res.send({ company: results.rows[0] })
        } else {
            results = await db.query('UPDATE invoices SET amt=$1, paid=$2 WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paid, id])

        }

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company with code of ${code}`, 404)
        }
        return res.send({ company: results.rows[0] })

    } catch (e) {
        return next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id])
        return res.send({ status: 'deleted' })
    } catch (e) {
        return next(e)
    }
})

router.get('/companies/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const company = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        const invoice = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code])
        if (company.rows.length === 0) {
            throw new ExpressError(`Cannot find company ${code}`, 404)
        }
        return res.send({
            company: company.rows[0],
            invoices: invoice.rows
        })
    }
    catch (e) {
        return next(e)
    }
})

module.exports = router;