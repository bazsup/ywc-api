import {Router} from "express";
import VError from "verror";
import bcrypt from "bcrypt-nodejs";

import {adminAuthen} from "../middlewares/authenticator";
import {ROLE_ANY, ROLE_ADMIN} from "../utils/const";
import {createJsonResponse} from "../utils/helpers";
import {Admin} from "../models";

const router = Router();

// get all backoffice user
router.get("/", adminAuthen(ROLE_ADMIN), async (req, res) => {
  try {
    const users = await Admin.find();

    return res.send(
      createJsonResponse("success", {
        users,
      }),
    );
  } catch (err) {
    return next(new VError(err, "/admin:get"));
  }
});

// create new backoffice user
router.post("/", adminAuthen(ROLE_ADMIN), async (req, res) => {
  const {username, password, role} = req.body;

  try {
    await Admin.create({
      role,
      username,
      password: bcrypt.hashSync(password, 10),
    });

    return res.send(createJsonResponse("success"));
  } catch (err) {
    return next(new VError(err, "/admin:post"));
  }
});

router.get("/me", adminAuthen(ROLE_ANY), (req, res) => {
  return res.send(
    createJsonResponse("success", {
      profile: req.admin,
    }),
  );
});

router.delete("/:id", adminAuthen(ROLE_ADMIN), async (req, res) => {
  try {
    await Admin.remove({_id: req.params.id});

    return res.send(createJsonResponse("success"));
  } catch (err) {
    return next(new VError(err, "/admin:delete id = ", req.params.id));
  }
});

export default router;
