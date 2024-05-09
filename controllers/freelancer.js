const Freelancers = require("../models/freelancer");
const { sendEmail } = require("../middlewares/sendEmail");
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
    const { firstname, lastname, username, email, password} = req.body;
    let freelancer = await Freelancers.findOne({ email });
    console.log(req.body);
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


exports.getFreelancerDetails = async (req, res) => {
  try {
    const freelancerId = req.freelancer._id; // Use the authenticated freelancer's ID

    const freelancer = await Freelancers.findById(freelancerId)
      .populate({
        path: "appliedProjects",
        populate: { path: "owner" } // Populate the owner field of each applied project
      });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }

    // You can customize the response based on what details you want to send to the client
    const freelancerDetails = {
      _id: freelancer._id,
      firstname: freelancer.firstname,
      lastname: freelancer.lastname,
      username: freelancer.username,
      email: freelancer.email,
      aboutme: freelancer.aboutme,
      skills: freelancer.skills,
      education: freelancer.education,
      experience: freelancer.experience,
      pfp: freelancer.pfp,
      appliedProjects: freelancer.appliedProjects,
      teams: freelancer.teams
      // Add other details as needed
    };

    console.log(freelancerDetails);

    res.status(200).json({
      success: true,
      freelancer: freelancerDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateFreelancerProfile = async (req, res) => {
  try {
    const freelancerId = req.freelancer._id; // Use the authenticated freelancer's ID

    // Find the freelancer by ID
    const freelancer = await Freelancers.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }

    // Extract the fields you want to update from the request body
    const { firstname, lastname, username, aboutme, skills, education, experience, pfp,appliedProjects } = req.body;

    // Update the freelancer's profile details
    if (firstname) freelancer.firstname = firstname;
    if (lastname) freelancer.lastname = lastname;
    if (username) freelancer.username = username;
    if (aboutme) freelancer.aboutme = aboutme;
    if (skills) freelancer.skills = skills;
    if (education) freelancer.education = education;
    if (experience) freelancer.experience = experience;
    if (pfp) freelancer.pfp = pfp;
    if (appliedProjects) freelancer.appliedProjects = appliedProjects;

    // Save the updated freelancer profile
  
    let skillsUpdated = false;
    if (skills && JSON.stringify(freelancer.skills) !== JSON.stringify(skills)) {
        freelancer.skills = skills;
        skillsUpdated = true;
    }

    await freelancer.save();

    // If skills are updated and freelancer is part of a team, update the team skills
    if (skillsUpdated && freelancer.teams) {
        await updateTeamSkills(freelancer.teams);
    }
    // You can customize the response based on what details you want to send to the client
    const updatedFreelancerDetails = {
      firstname: freelancer.firstname,
      lastname: freelancer.lastname,
      username: freelancer.username,
      aboutme: freelancer.aboutme,
      skills: freelancer.skills,
      education: freelancer.education,
      experience: freelancer.experience,
      pfp: freelancer.pfp,
      appliedProjects: freelancer.appliedProjects,
      // Add other details as needed
    };

    res.status(200).json({
      success: true,
      freelancer: updatedFreelancerDetails,
      message: "Profile Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

async function updateTeamSkills(teamId) {
    const team = await Team.findById(teamId).populate('members');
    const newSkills = {};

    team.members.forEach(member => {
        member.skills.forEach(skill => {
            newSkills[skill] = (newSkills[skill] || 0) + 1;
        });
    });

    team.teamSkills = Object.keys(newSkills).map(skill => ({ skill, count: newSkills[skill] }));
    await team.save();
}

exports.forgetPassword = async (req,res)=>{
  try {
    const {email} = req.body;
    const freelancer = await Freelancers.findOne({email});
    if(!freelancer){
      return res.status(400).json({
        success: false,
        message: "Freelancer with this email does not exists",
      });
    }
    const resetToken = await freelancer.getResetPasswordCode();
    await freelancer.save()
    await sendEmail({
      email: freelancer.email,
      subject: "Reset Password",
      message: `Use the following password verification code to change your password.This code is valid only for 10 mins. Your password reset code is: ${resetToken} If you have not requested this email then please ignore it`,

    })
    console.log(resetToken);
    res.status(200).json({
      success: true,
      resetToken,
      message: `Reset password verification code sent to ${email}`,
    });
  }   
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
exports.resetPassword = async (req,res)=>{
  try {
    const {resetPasswordToken} = req.body;
    // const resetPasswordToken = crypto
    // .createHash("sha256")
    // .update(req.params.token)
    // .digest("hex");
    console.log(resetPasswordToken)
    const user = await Freelancers.findOne({
      resetPasswordToken,
      resetPasswordDate: { $gt: Date.now() },
    });
    console.log(user)
  
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset password verification code is invalid or has been expired",
      });
    }
    // user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      email:user.email, //user email to use for new password reset
      message: "Password reset code verified successfully",
    });
  }catch(err){
    console.log(err);
    res.sendStatus(400);
  }
};
exports.setNewPassword = async (req,res)=>{
  try {
    const {email,password} = req.body;
    console.log(email)
    console.log(password)
    const freelancer = await Freelancers.findOne({ email });
    freelancer.password = password
    await freelancer.save()
    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  }catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.searchFreelancer = async (req, res) => {
  try {
    const { username } = req.body;
    

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Freelancer username is required for search.",
      });
    }

    const freelancer = await Freelancers.find({ username: { $regex: new RegExp(username, "i") } });

    res.status(200).json({
      success: true,
      freelancer,
    });
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