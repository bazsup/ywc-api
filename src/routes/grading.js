import {Router} from "express";
import _ from "lodash";
import VError from "verror";
import {Admin, User, Question} from "../models";
import {adminAuthen} from "../middlewares/authenticator";
import {ROLE_STAFF, ROLE_COMMITTEE, ROLE_MANAGER} from "../utils/const";
import {responseError} from "../middlewares/error";
import {createJsonResponse} from "../utils/helpers";

const router = Router();

router.post("/staff/pass", adminAuthen(ROLE_STAFF), async (req, res, next) => {
  try {
    const {id, comment} = req.body;
    const user = await User.findOne({_id: id});

    if (!user) {
      return responseError(res, "user not found");
    }

    if (user.failed || user.isPassStaff) {
      return responseError(res, "user is already judged");
    }

    user.isPassStaff = true;
    user.staffUsername = req.admin.username;
    if (comment) {
      user.staffComment = comment;
    }

    await user.save();

    return res.send(createJsonResponse("success"));
  } catch (e) {
    return next(new VError(e, "/staff/pass"));
  }
});

router.post("/staff/eject", adminAuthen(ROLE_STAFF), async (req, res, next) => {
  try {
    const {id} = req.body;
    const user = await User.findOne({_id: id});

    if (!user) {
      return responseError(res, "user not found");
    }

    if (user.failed || user.isPassStaff) {
      return responseError(res, "user is already judged");
    }

    user.isPassStaff = true;
    user.failed = true;
    user.staffUsername = req.admin.username;

    await user.save();

    return res.send(createJsonResponse("success"));
  } catch (e) {
    return next(new VError(e, "/staff/eject"));
  }
});

router.post(
  "/committee/vote",
  adminAuthen(ROLE_COMMITTEE),
  async (req, res, next) => {
    try {
      const {id, score} = req.body;
      const user = await User.findOne({_id: id});

      if (!user) {
        return responseError(res, "user not found");
      }

      if (
        user.failed ||
        !user.isPassStaff ||
        user.committeeVote.indexOf(req.admin.username) !== -1
      ) {
        return responseError(res, "user is already judged");
      }

      if (typeof user.committeeVote === "undefined") {
        user.committeeVote = [req.admin.username];
      } else {
        user.committeeVote = [...user.committeeVote, req.admin.username];
      }

      if (!user.committeeScore) {
        user.committeeScore = +score;
      } else {
        user.committeeScore += +score;
      }

      await user.save();

      return res.send(createJsonResponse("success"));
    } catch (e) {
      return next(new VError(e, "/committee/vote"));
    }
  },
);

router.post(
  "/manager/status",
  adminAuthen(ROLE_MANAGER),
  async (req, res, next) => {
    try {
      const {
        id,
        score,
        reservation,
        interview,
        finalist,
        interviewRef,
      } = req.body;
      const user = await User.findOne({_id: id});

      if (!user) {
        return responseError(res, "user not found");
      }

      if (reservation !== undefined) {
        user.isReservation = reservation;
      }

      if (interview !== undefined) {
        user.passInterview = interview;
      }

      if (finalist !== undefined) {
        user.isFinalist = finalist;
      }

      if (score !== undefined) {
        user.committeeScore = +score;
      }

      if (interviewRef !== undefined) {
        user.interviewRef = interviewRef;
      }

      await user.save();

      return res.send(createJsonResponse("success"));
    } catch (e) {
      return next(new VError(e, "/manager/status"));
    }
  },
);

export default router;
