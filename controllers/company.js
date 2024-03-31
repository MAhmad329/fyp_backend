// const User = require("../models/user");
// const Post = require("../models/posts");
const Companies = require("../models/company");
const Project = require("../models/project");
const Team = require("../models/team");
const { sendEmail } = require("../middlewares/sendEmail");


exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const company = await Companies.findOne({ email }).select("+password");

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exist",
      });
    }
    const isMatch = await company.matchPassword(password);

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
    const token = await company.generateToken();
    res.status(200).cookie("token", token, options).json({
      success: true,
      company,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.selectFreelancerOrTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { selectedId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.requiresTeam) {
      const team = await Team.findById(selectedId); // Fetch the team from the database
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      project.selectedTeam = selectedId;
      team.assignedProjects.push(projectId);
      await team.save(); // Save the updated team
    } else {
      project.selectedApplicant = selectedId;
    }

    await project.save();

    res.status(200).json({ message: 'Selection updated successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

};

exports.logoutCompany = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "company Loged Out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.registerCompany = async (req, res) => {
  try {
    const { companyname, businessAddress, name, email, password } = req.body;
    let focalpersonemail = await Companies.findOne({ email });
    let nameofcompany = await Companies.findOne({ companyname });
    
    if (nameofcompany) {
      return res.status(400).json({
        success: false,
        message: "Company name already exists",
      });
    }

    if (focalpersonemail) {
      return res.status(400).json({
        success: false,
        message: "User already Exists",
      });
    }

    company = await Companies.create({
      companyname,  
      businessAddress,
      name,
      email,
      password,
    //   avatar,
    //   bio,
      // avatar: {
      //   public_id: "sample_id",
      //   url: "sample Url",
      // },
    });

    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCompanyDetails = async (req, res) => {
  try {
    const companyId = req.company._id; // Use the authenticated freelancer's ID

    const company = await Companies.findById(companyId).populate("projects");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // You can customize the response based on what details you want to send to the client
    const companyDetails = {
      _id: company._id,
      companyname: company.companyname,
      businessAddress: company.businessAddress,
      name: company.name,
      email: company.email,
      projects: company.projects,
      pfp: company.pfp,
    };

    console.log(companyDetails);

    res.status(200).json({
      success: true,
      company: companyDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.company._id; // Use the authenticated freelancer's ID

    // Find the freelancer by ID
    const company = await Companies.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Extract the fields you want to update from the request body
    const { companyname, businessAddress, name, email, pfp, projects } = req.body;

    // Update the freelancer's profile details
    if (companyname) company.companyname = companyname;
    if (businessAddress) company.businessAddress = businessAddress;
    if (name) company.name = name;
    if (email) company.email = email;
    if (pfp) company.pfp = pfp;
    if (projects) company.projects = projects;
    
    // Save the updated freelancer profile
    await company.save();

    // You can customize the response based on what details you want to send to the client
    const updatedCompanyDetails = {
      companyname: company.companyname,
      businessAddress: company.businessAddress,
      name: company.name,
      email: company.email,
      pfp: company.pfp,
      projects: company.projects,
      // Add other details as needed
    };

    res.status(200).json({
      success: true,
      company: updatedCompanyDetails,
      message: "Profile Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.forgetPassword = async (req,res)=>{
  try {
    const {email} = req.body;
    const company = await Companies.findOne({email});
    if(!company){
      return res.status(400).json({
        success: false,
        message: "Company with this email does not exists",
      });
    }
    const resetToken = await company.getResetPasswordCode();
    await company.save()
    await sendEmail({
      email: company.email,
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
    const user = await Companies.findOne({
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
    const company = await Companies.findOne({ email });
    company.password = password
    await company.save()
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

// exports.updatecompanyProfile = async (req, res) => {
//   try {
//     const company = await Companies.findById(req.company._id);
//     const { name, email } = req.body;
//     if (name) {
//       company.name = name;
//     }
//     if (email) {
//       company.email = email;
//     }
//     await company.save();

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

// exports.getMycompanyProfile = async (req, res) => {
//   try {
//     const company = await Companies.findById(req.company._id).populate(
//       "jobs"
//     );
//     res.status(200).json({
//       success: true,
//       company,
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