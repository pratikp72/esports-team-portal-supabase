import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
// import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase =createClient()

const RequestModal = ({ open, handleClose, teamId }) => {
  const [requests, setRequests] = useState([]);

  // Fetch requests and user details
  const fetchRequests = async () => {
    const { data: requestData, error } = await supabase
      .from("join_requests")
      .select("id, member_id").eq('team_id',teamId);

    if (error) {
      console.error("Error fetching requests:", error);
      return;
    }

    // Fetch user details for each request
    const userIds = requestData.map((req) => req.member_id);
    const { data: users, error: userError } = await supabase
      .from("profiles") // Assuming "users" table contains user data
      .select("id, full_name, email")
      .in("id", userIds);

    if (userError) {
      console.error("Error fetching users:", userError);
      return;
    }

    // Merge user details with requests
    const requestsWithUsers = requestData.map((req) => ({
      ...req,
      user: users.find((u) => u.id === req.member_id),
    }));

    setRequests(requestsWithUsers);
  };

  useEffect(() => {
    if (open) fetchRequests();
  }, [open]);

  // Accept request: Add to team_member and remove request
  const handleAccept = async (request) => {
    const { member_id } = request;

    const { error: insertError } = await supabase
      .from("team_members")
      .insert([{ user_id:member_id,team_id:teamId }]);

    if (insertError) {
      console.error("Error adding team member:", insertError);
      return;
    }
    toast.success('Player Joined Successfully')

    await handleReject(request.id); // Remove request after accepting
  };

  // Reject request: Remove from request table
  const handleReject = async (requestId) => {
    const { error } = await supabase
      .from("join_requests")
      .delete()
      .eq("id", requestId);
      toast.success('Request Removed Successfully')
    if (error) {
      console.error("Error deleting request:", error);
      return;
    }

    setRequests((prev) => prev.filter((req) => req.id !== requestId)); // Update UI
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >

        <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" gutterBottom>
          Team Join Requests
        </Typography>
        <button onClick={handleClose}>
            <CloseIcon/>
        </button>
        </div>

        <Grid container spacing={2}>
          {requests.length > 0 ? (
            requests.map((request) => (
              <Grid item xs={12} key={request.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{request.user?.full_name || "Unknown"}</Typography>
                    <Typography color="textSecondary">{request.user?.email || "No Email"}</Typography>
                    <Box mt={2} display="flex" gap={1}>
                      <Button variant="contained" color="success" onClick={() => handleAccept(request)}>
                        Accept
                      </Button>
                      <Button variant="contained" color="error" onClick={() => handleReject(request.id)}>
                        Reject
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No pending requests</Typography>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

export default RequestModal;
