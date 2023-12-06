const Freelancers = require("../models/freelancer");

exports.loginFreelancer = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const freelancer = await Freelancers.findOne({ email }).select("+password");

    if (!freelancer) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exists",
      });
    }
    const isMatch = await freelancer.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }
    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    const token = await freelancer.generateToken();
    res.status(200).cookie("token", token, options).json({
      success: true,
      freelancer,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logoutFreelancer = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "freelancer Loged Out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.registerFreelancer = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;
    let freelancer = await Freelancers.findOne({ email });
    if (freelancer) {
      return res.status(400).json({
        success: false,
        message: "User already Exists",
      });
    }

    freelancer = await Freelancers.create({
      firstname,  
      lastname,
      username,
      email,
      password,
    //   avatar,
    //   bio,
      // avatar: {
      //   public_id: "sample_id",
      //   url: "sample Url",
      // },
    });

    res.status(201).json({ success: true, freelancer });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.updatePassword = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("+password");

//     const { previousPassword, newPassword } = req.body;

//     console.log(previousPassword, newPassword);

//     if (!previousPassword || !newPassword) {
//       res.status(400).json({
//         success: true,
//         message: "Please provide previous Password and New Password",
//       });
//     }

//     const isMatch = await user.matchPassword(previousPassword); //  We already have a matchPassword funcnction
//     if (!isMatch) {
//       res.status(404).json({
//         success: false,
//         message: "Wrong Previous Password",
//       });
//     } else {
//       user.password = newPassword;
//       await user.save();
//       res.status(200).json({
//         success: true,
//         message: "Password Changed",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.updatefreelancerProfile = async (req, res) => {
//   try {
//     const freelancer = await Freelancers.findById(req.freelancer._id);
//     const { name, email } = req.body;
//     if (name) {
//       freelancer.name = name;
//     }
//     if (email) {
//       freelancer.email = email;
//     }
//     await freelancer.save();

//     res.status(200).json({
//       success: true,
//       message: "Profile Updated",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const posts = user.posts;
//     const userID = user._id;
//     const followers = user.followers;
//     const following = user.following;

//     await user.deleteOne();
//     // Also logout user after removing user
//     res.cookie("token", null, {
//       expires: new Date(Date.now()),
//       httpOnly: true,
//     });
//     // Also remove posts associated to the user
//     for (let i = 0; i < posts.length; i++) {
//       const post = await Post.findById(posts[i]);
//       await post.deleteOne();
//     }

//     // Also remove the user from others following list
//     for (let i = 0; i < followers.length; i++) {
//       const follower = await User.findById(followers[i]);

//       const index = follower.following.indexOf(userID);
//       follower.following.splice(index, 1);
//       await follower.save();
//     }

//     // Also remove the user from others follower list
//     for (let i = 0; i < following.length; i++) {
//       const follows = await User.findById(following[i]);

//       const index = follows.followers.indexOf(userID);
//       follows.following.splice(index, 1);
//       await follows.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: "User Deleted",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getMyfreelancerProfile = async (req, res) => {
//   try {
//     const freelancer = await Freelancers.findById(req.freelancer._id).populate(
//       "jobs"
//     );
//     res.status(200).json({
//       success: true,
//       freelancer,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.forgetPassword = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not Found",
//       });
//     }

//     const resetPasswordToken = user.getResetPasswordToken();
//     await user.save();

//     const resetUrl = `${req.protocol}://${req.get(
//       "host"
//     )}/api/v1/passowrd/reset/${resetPasswordToken}`;
//     const message = `Reset your password by clicking the link below: \n\n ${resetUrl}`;
//     try {
//       await sendEmail({
//         email: user.email,
//         subject: "Reset Password",
//         message,
//       });
//       res.status(200).json({
//         success: true,
//         message: `Email sent to ${user.email}`,
//       });
//     } catch (error) {
//       user.resetPasswordToken = undefined;
//       user.resetPasswordDate = undefined;
//       await user.save();
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };