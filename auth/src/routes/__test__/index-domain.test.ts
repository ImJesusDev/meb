import request from "supertest";
import { app } from "../../app";
import { Domain } from "../../models/domain";

it("it can fetch a list of domains", async (done) => {
  let domains = await Domain.find({});
  expect(domains.length).toEqual(0);
  const cookie = await global.signin();
  let response = await request(app)
    .post("/api/users/domains")
    .set("Cookie", cookie)
    .send({
      domains: [{ domain: "claro.com.co", client: "Claro" }],
    });
  expect(response.status).toEqual(201);
  domains = await Domain.find({});
  expect(domains.length).toEqual(2);

  response = await request(app).get("/api/users/domains").send({});
  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(2);
  return done();
});

it("it can filter a list of domains by client", async (done) => {
  const cookie = await global.signin();
  let response = await request(app)
    .post("/api/users/domains")
    .set("Cookie", cookie)
    .send({
      domains: [{ domain: "claro.com.co", client: "Claro" }],
    });
  expect(response.status).toEqual(201);

  response = await request(app).get("/api/users/domains?client=Claro").send({});
  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(2);

  response = await request(app).get("/api/users/domains?client=Fake").send({});
  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(0);

  return done();
});
