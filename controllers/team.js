// Controller function to add a member to a team or create a new team if none exists
const Freelancer = require("../models/freelancer");
const Team = require("../models/team");


exports.addMemberToTeam = async (req, res) => {
  console.log(req.body)
    const  memberId  = req.body.memberID;
    const freelancerId = req.freelancer._id;
    console.log(memberId)
    console.log(freelancerId)
    
    try {
      // Find the freelancer by ID
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        return res.status(404).json({ error: 'Freelancer not found' });
      }
      const member = await Freelancer.findById(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
  
      // Check if the freelancer already has a team
      let teamId;
       //step-1
       //Freelancer has a team
       if(freelancer.teams){
        // freelancer.teams.push(memberId)
        const team = await Team.findById(freelancer.teams);
        console.log(team)

        //Member is not in any team
        //Freelancer has not already added member to his team
        if ((!member.teams)){
            team.members.push(memberId)
            member.teams=team._id
            const newSkills = member.skills.filter(skill => !team.teamSkills.includes(skill));
            team.teamSkills = [...team.teamSkills, ...newSkills];
            await team.save()
            await member.save()
            res.status(200).json({ message: 'Member added to team successfully' });

        }
        else{
            return res.status(400).json({ error: 'Member already exists in a team' });

        }
        
        }
        else{
            //Member does not have a team
            if(!member.teams){
                const combinedSkills = new Set([...freelancer.skills, ...member.skills]);
                const newTeam = new Team({
                    name: `${freelancer.firstname}'s Team`,
                    members: [freelancerId,memberId],
                    owner: freelancer,
                    teamSkills: Array.from(combinedSkills) 
        
                });
                await newTeam.save();
                teamId = newTeam._id;
    
                // Update freelancer's team field
                freelancer.teams = teamId;
                member.teams = teamId
                await freelancer.save();
                await member.save()
                res.status(200).json({ message: 'Member added to team successfully' });
            }
            else{
                return res.status(400).json({ error: 'Member already exists in the team' });
            }
        }
      

      }
       
     catch (error) {
      console.error('Error adding member to team or creating team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


// exports.addMemberToTeam = async (req, res) => {
//   const memberId = req.body.memberID;
//   const freelancerId = req.freelancer._id;

//   try {
//     const freelancer = await Freelancer.findById(freelancerId);
//     const member = await Freelancer.findById(memberId);
//     if (!freelancer || !member) {
//       return res.status(404).json({ error: 'Freelancer or Member not found' });
//     }

//     let team;
//     if (freelancer.teams) {
//       // Add member to existing team
//       const team = await Team.findById(freelancer.teams);
//       if (!team.members.includes(memberId)) {
//         team.members.push(memberId);
//         member.teams = team._id;

//         // Update teamSkills
//         const newSkills = member.skills.filter(skill => !team.teamSkills.includes(skill));
//         team.teamSkills = [...team.teamSkills, ...newSkills];

//         await team.save();
//         await member.save();
//         res.status(200).json({ message: 'Member added to team successfully' });
//       } else {
//         return res.status(400).json({ error: 'Member already in the team' });
//       }
//     } else {
//       // Create a new team if not exist
//       const combinedSkills = new Set([...freelancer.skills, ...member.skills]);
//       team = new Team({
//         name: `${freelancer.firstname}'s Team`,
//         members: [freelancerId, memberId],
//         owner: freelancerId,
//         teamSkills: Array.from(combinedSkills)  // Include skills from both freelancer and member
//       });
//       await team.save();

//       freelancer.teams = team._id;
//       member.teams = team._id;
//       await freelancer.save();
//       await member.save();
//       res.status(200).json({ message: 'New team created and member added successfully' });
//     }
//   } catch (error) {
//     console.error('Error in addMemberToTeam:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



// exports.deleteMemberFromTeam = async (req, res) => {
//   const memberId = req.body.memberID;
//   const freelancerId = req.freelancer._id;

//   try {
//     const freelancer = await Freelancer.findById(freelancerId);
//     const team = freelancer.teams ? await Team.findById(freelancer.teams) : null;
//     if (!team || !team.members.includes(memberId)) {
//       return res.status(404).json({ error: 'Team or Member not found in the team' });
//     }

//     // Remove the member
//     team.members = team.members.filter(id => id.toString() !== memberId);
//     const memberToRemove = await Freelancer.findById(memberId);
//     memberToRemove.teams = null;

//     // Update teamSkills
//     const remainingMembers = await Freelancer.find({_id: { $in: team.members }});
//     const remainingSkills = new Set(remainingMembers.flatMap(m => m.skills));
//     team.teamSkills = Array.from(remainingSkills);

//     await team.save();
//     await memberToRemove.save();

//     res.status(200).json({ message: 'Member removed from the team successfully' });
//   } catch (error) {
//     console.error('Error in deleteMemberFromTeam:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


 exports.deleteMemberFromTeam = async (req, res) => {
    try {
        const memberId = req.body.memberID; // Assuming memberId is passed in the body
        const freelancerId = req.freelancer._id; // Assuming freelancerId is set in req.freelancer

        // Find the freelancer by ID
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            return res.status(404).json({ error: 'Freelancer not found' });
        }

        // Check if the freelancer has a team
        if (!freelancer.teams) {
            return res.status(404).json({ error: 'Freelancer does not have a team' });
        }

        // Find the team of the freelancer
        const team = await Team.findById(freelancer.teams);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if the member is the owner
        if (freelancerId === team.owner.toString()) {
            return res.status(403).json({ error: 'You are the owner of the team. You cannot leave the team.' });
        }

        // Check if the member exists in the team
        if (!team.members.includes(memberId)) {
            return res.status(404).json({ error: 'Member does not exist in the team' });
        }

        // Remove the member from the team
        const index = team.members.indexOf(memberId);
        if (index !== -1) {
            team.members.splice(index, 1); // Remove 1 element starting from the index
      }
      
        const remainingMembers = await Freelancer.find({_id: { $in: team.members }});
        const remainingSkills = new Set(remainingMembers.flatMap(m => m.skills));
        team.teamSkills = Array.from(remainingSkills);
        // Save the team document
        await team.save();

        // Update the member's teams field
        const member = await Freelancer.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        member.teams = null;
        await member.save();

        if (team.members.length === 0) {
            await Team.findByIdAndDelete(team._id)
            res.status(200).json({ message: 'Team deleted as the last member has left' });
        } else {
            res.status(200).json({ message: 'Member removed from the team successfully' });
        }
    } catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// exports.deleteMemberFromTeam = async (req, res) => {
//     try {
//         const memberId = req.body.memberID; // Assuming memberId is passed in the body
//         const freelancerId = req.freelancer._id; // Assuming freelancerId is set in req.freelancer

//         // Find the freelancer by ID
//         const freelancer = await Freelancer.findById(freelancerId);
//         if (!freelancer) {
//             return res.status(404).json({ error: 'Freelancer not found' });
//         }

//         // Check if the freelancer has a team
//         if (!freelancer.team) {
//             return res.status(404).json({ error: 'Freelancer does not have a team' });
//         }

//         // Find the team of the freelancer
//         const team = await Team.findById(freelancer.teams);
//         if (!team) {
//             return res.status(404).json({ error: 'Team not found' });
//         }

//         // Check if the member exists in the team
//         if (!team.members.includes(memberId)) {
//             return res.status(404).json({ error: 'Member does not exist in the team' });
//         }

//         // Remove the member from the team
//         team.members.pull(memberId);  // This is a Mongoose way to remove an item from an array
//         await team.save();

//         // Update the member's teams field to null
//         const member = await Freelancer.findById(memberId);
//         if (member) {
//             member.teams = null;
//             await member.save();
//         }

//         // Check if there are no more members in the team
//         if (team.members.length === 0) {
//             await team.remove();  // Remove the team if no members left
//             res.status(200).json({ message: 'Team deleted as the last member has left' });
//         } else {
//             res.status(200).json({ message: 'Member removed from the team successfully' });
//         }
//     } catch (error) {
//         console.error('Error leaving team:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

  
  
exports.fetchAllTeams = async (req, res) => {
    try {
        // Fetch all teams and populate necessary references
      const teams = await Team.find({})
        .populate('members')  // Assuming you only want name and skills of members
        .populate('owner')  // Assuming you only want the name of the owner
        .populate('projects'); // Populate specific fields for projects
                             

        // Check if teams exist
        if (!teams || teams.length === 0) {
            return res.status(404).json({ message: 'No teams found' });
        }

        // Send successful response
        res.status(200).json({ success: true, teams });
    } catch (error) {
        console.error('Error fetching all teams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

 exports.fetchteam = async (req, res) => {
  const freelancerId = req.freelancer._id;
  console.log(freelancerId);
  try {
    const freelancer = await Freelancer.findById(freelancerId).populate({
      path: 'teams',
      populate: [
        {
          path: 'members'
        },
        {
          path: 'owner'
        },
        {
          path: 'projects'
        }
      ]
    });
    console.log(freelancer);
    return res.status(200).json({ success: true, freelancer, message: 'Fetched Team' });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

