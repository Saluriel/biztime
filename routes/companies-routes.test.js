process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db")

let apple;
let company = { code: "apple", description: "Makes computers", name: "Apple Computers" }

beforeEach(async function () {
    const apple = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, ["apple", "Apple Computers", "Makes computers"])
});

afterEach(function () {
    db.query(`DELETE FROM companies`)


});


describe("GET /companies", function () {
    test("Gets a list of companies", async function () {
        const resp = await request(app).get(`/companies`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.companies[0].code).toEqual("apple")
    })
})

describe("GET /companies/:code", function () {
    test("Gets company by the code", async function () {
        const resp = await request(app).get(`/companies/apple`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ company })
    })
})

describe("POST /companies", function () {
    test("Creates a new company", async function () {
        const resp = await request(app)
            .post(`/companies`)
            .send({
                name: "GoodCompany",
                description: "Also makes computers"
            });

        expect(resp.statusCode).toBe(201);
        expect(resp.body.company.code).toEqual("goodcompany")
    })
})

describe("PUT /companies/:code", function () {
    test("Updates a single company", async function () {
        const resp = await request(app)
            .put(`/companies/apple`)
            .send({
                name: "AAAAAAAAAAAAAAAAAAAAAAAAAAPPLE Computers",
                description: "hi here's a description",
            });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            company: {
                code: "apple",
                name: "AAAAAAAAAAAAAAAAAAAAAAAAAAPPLE Computers",
                description: "hi here's a description",
            }
        })
    })
})

describe("DELETE /companies/:code", function () {
    test("Deletes a single company", async function () {
        const resp = await request(app)
            .delete('/companies/apple')

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ status: 'deleted' })
    })
})