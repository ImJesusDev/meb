import request from "supertest";
import { app } from "../../app";
import { Domain } from "../../models/domain";
import { Email } from "../../models/email";

beforeEach(async () => {
  const email = Email.build({
    email: "test@test.com",
    client: "Claro",
    office: "Sede Principal",
    active: true,
  });
  await email.save();
  const domain = Domain.build({
    domain: "test.com",
    client: "Claro",
    active: true,
  });
  await domain.save();
});
it("clears cookie after signing out", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
      firstName: "Regular",
      lastName: "User",
      client: "Claro",
      office: "Sede Principal",
      mainTransportationMethod: "Carro",
      secondaryTransportationMethod: "Moto",
      termsDate: true,
      comodatoDate: true,
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);
  expect(response.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.moversapp.co"
    // 'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.meb.dev'
  );
});
