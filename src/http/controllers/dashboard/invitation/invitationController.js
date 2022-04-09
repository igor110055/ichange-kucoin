const httpErrors = require("http-errors");

// UTILS
const invitationCode = require("../../../../utils/invitationCode");
// MODELS
const Invitation = require("../../../../models/invitation");

class invitationController {
  async addInvitation(req, res, next) {
    const { userShare, friendShare } = req.body;
    const allInvitaions = await Invitation.find({});
    const referralCodes = [];
    allInvitaions.forEach((invitation) => {
      referralCodes.push(invitation.referralCode);
    });
    const addInvitation = new Invitation({
      userId: req.user.id,
      referralCode: await invitationCode(referralCodes),
      userShare,
      friendShare,
    });
    addInvitation.save((err, data) => {
      if (err) {
        console.log(err);
      } else if (data) {
        return res.json({
          statusCode: 200,
          message: "کد معرف ایجاد شد",
          status: true,
          data: addInvitation,
        });
      }
    });
  }

  async getInvationUserList(req, res, next) {
    const findInvations = await Invitation.find({
      userId: req.user.id,
    }).populate([{ path: "userId" }, { path: "friendShared" }]);
    return res.json({
      status: true,
      message: "دریافت تمامی کد دعوت ها ",
      data: findInvations,
      statusCode: 200,
    });
  }
}

module.exports = new invitationController();
