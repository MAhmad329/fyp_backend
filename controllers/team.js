// Controller function to add a member to a team or create a new team if none exists
const Freelancer = require("../models/freelancer");
const Team = require("../models/team");


exports.addMemberToTeam = async (req, res) => {
    const  memberId  = req.body.memberID;
    const freelancerId = req.body.freelancerID; // Assuming you have user data stored in req.user after authentication
    
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
      console.log(!freelancer.teams.includes(memberId))
      console.log(!member.teams.length)
      
      if ((!freelancer.teams.includes(memberId))&&(!member.teams.length)) {
        // If the freelancer does not have a team, create a new team
        const newTeam = new Team({
          name: `${freelancer.firstname}'s Team`,
          members: [freelancerId,memberId],

        });
        
        await newTeam.save();
        teamId = newTeam._id;
  
        // Update freelancer's team field
        freelancer.teams = teamId;
        member.teams = teamId 
        await freelancer.save();
        await member.save()
        res.status(200).json({ message: 'Member added to team successfully' });

      } else {
        // If the freelancer already has a team, use the existing team
      
        return res.status(400).json({ error: 'Member already exists in the team' });
      
      }
    //   console.log(teamId)
  
    //   //Find the team by ID
    //   const team = await Team.findById(teamId);
    //   if (!team) {
    //     return res.status(404).json({ error: 'Team not found' });
    //   }
  
    //  // Check if the member is already part of the team
    //   if (team.members.includes(memberId)) {
    //     return res.status(400).json({ error: 'Member already exists in the team' });
    //   }
  
    //   // Add the member to the team
    //   team.members.push(memberId);
    //   await team.save();
  
       
    } catch (error) {
      console.error('Error adding member to team or creating team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  