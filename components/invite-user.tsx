"use client"; // Needed for Next.js App Router

import { useState } from "react";
import { Button, Modal, Box, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

export default function InviteModal({open,handleClose}) {
//   const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setOpen(false);
//     setEmail("");
//     setMessage("");
//   };

  async function sendInvite() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, isAdmin: true }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      toast.success("Invitation sent successfully!");
      handleClose()
    } else {

      toast.error(`Error: ${data.error}`);
    }
  }

  return (

     

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}

        >
            <div className="flex justify-between">

         
          <Typography variant="h6" gutterBottom>
            Send Invitation
          </Typography>
          <button onClick={handleClose}>
            <CloseIcon/>
          </button>
          </div>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          {message && (
            <Typography variant="body2" color={message.includes("Error") ? "error" : "success"}>
              {message}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={sendInvite}
            disabled={loading || !email}
            fullWidth
          >
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </Box>
      </Modal>
  
  );
}
