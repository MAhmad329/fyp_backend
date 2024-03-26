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
                const newTeam = new Team({
                    name: `${freelancer.firstname}'s Team`,
                    members: [freelancerId,memberId],
                    owner: freelancer
        
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

  exports.deleteMemberFromTeam = async (req, res) => {
    try {
      const memberId = req.body.memberID; // Assuming memberId is passed as a route parameter
      const freelancerId = req.freelancer._id;
  
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
      console.log(team)
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      // Check if the member exists in the team
      if (!team.members.includes(memberId)) {
        return res.status(404).json({ error: 'Member does not exist in the team' });
      }

      if (memberId==freelancerId){
        return res.status(404).json({ error: 'You are the owner of this team' });
      }
  
      // Remove the member from the team
      const index = team.members.indexOf(memberId);

      // If memberId is found in the array, remove it
        if (index !== -1) {
          team.members.splice(index, 1); // Remove 1 element starting from the index
      }
      // Save the team document
      await team.save();
  
      // Update the member's teams field
      const member = await Freelancer.findById(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
  
      member.teams = null;
      await member.save();
  
      res.status(200).json({ message: 'Member removed from team successfully' });
    } catch (error) {
      console.error('Error deleting member from team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  exports.fetchteam = async (req, res) => {

    const freelancerId = req.freelancer._id; 
    console.log(freelancerId)
    try {
      const freelancer = await Freelancer.findById(freelancerId).populate({
        path: 'teams',
        populate: {
            path: 'members'
        }
    });
      console.log(freelancer)
      return res.status(200).json({ success:true,freelancer,message: 'Fetched Team' });
    }
     catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };