process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db")

let apple;

beforeEach(async function () {
    const appleCompany = db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, ["apple", "Apple Computers", "Makes computers"])
    const appleInvoice = await db.query(`INSERT INTO invoices (id, add_date, comp_code, amt, paid, paid_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING comp_code, amt, paid, paid_date`, [1, "2020-10-11", "apple", 100, true, '2022-03-03'])
});

afterEach(function () {
    db.query(`DELETE FROM invoices`)
    db.query(`DELETE FROM companies`)
});


describe("GET /invoices", function () {
    test("Gets a list of invoices", async function () {
        const resp = await request(app).get(`/invoices`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.invoices[0].comp_code).toEqual("apple")
    })
})


describe("GET /invoices/:id", function () {
    test("Gets invoice by the id", async function () {
        const resp = await request(app).get(`/invoices/1`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.company.comp_code).toEqual("apple")
    })
    test("Throws a 404 error when the invoice doesn't exist", async function () {
        const resp = await request(app).get(`/invoices/0`)

        expect(resp.statusCode).toBe(404)
    })
})

describe("POST /invoices", function () {
    test("Creates a new invoice", async function () {
        const resp = await request(app)
            .post(`/invoices`)
            .send({
                comp_code: "apple",
                amt: 800
            });

        expect(resp.statusCode).toBe(201);
        expect(resp.body.invoice.comp_code).toEqual("apple")

    })
})

describe("PUT /invoices/:id", function () {
    test("Updates a single company", async function () {
        const resp = await request(app)
            .put(`/companies/apple`)
            .send({
                name: "AAAAAAAAAAAAAAAAAAAAAAAAAAPPLE Computers",
                description: "hi here's a description",
            });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.company.name).toEqual("AAAAAAAAAAAAAAAAAAAAAAAAAAPPLE Computers")
    })
    test("Throws a 404 error when the invoice doesn't exist", async function () {
        const resp = await request(app).get(`/invoices/0`)

        expect(resp.statusCode).toBe(404)
    })
})

describe("DELETE /invoices/:id", function () {
    test("Deletes a single invoice", async function () {
        const resp = await request(app)
            .delete('/invoices/1')

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ status: 'deleted' })
    })
})

describe("GET invoices/companies/:code", function () {
    test("Gets a list of a company and all its invoices", async function () {
        const resp = await request(app).get(`/invoices/companies/apple`)

        expect(resp.statusCode).toBe(200);
        expect(resp.body.company.name).toEqual("Apple Computers")
    })
    test("Throws a 404 error when the company doesn't exist", async function () {
        const resp = await request(app).get(`/invoices/companies/notapple`)

        expect(resp.statusCode).toBe(404)
    })
})