"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  Box,
  MenuItem,
  Modal,
  Typography,
} from "@mui/material";
import StatusDot from "@/components/status-dot";
import ProfileSettingsModalWithAnimation from "@/components/ProfileModal";
import RequestModal from "@/components/request-modal";

const supabase = createClient();

interface Player {
  id: string;
  full_name: string;
  email: string;
}

export default function TeamPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState("");
  const params = useParams();
  const router = useRouter();
  const [isProfileShow, setisProfileShow] = useState(false);
  const [activePlayer, setactivePlayer] = useState({});
  const [teamData, setteamData] = useState({});
  const teamId = params.id as string;
  const [showCaptain, setshowCaptain] = useState(false);
  const [showRequestModal, setshowRequestModal] = useState(false)
  const [userId, setuserId] = useState('')

  const updateRecord = async (userId) => {
    if (!teamId) {
      alert("error");
      return;
    }
    
    const { data, error } = await supabase
      .from("teams")
      .update({
        captain_id: userId,
      })
      .eq("id", teamId)
      .select();
    await fetchTeamAndPlayers();
    if (error) {
      console.error("Error updating record:", error);
      return null;
    }
    alert("Captain updated successfully");
    return data;
  };
  useEffect(() => {
    fetchTeamAndPlayers();
  }, [teamId]);
  const fetchTeamAndPlayers = async () => {
    try {
      // ✅ Fetch team name
      const { data:userData } = await supabase.auth.getUser();
      setuserId(userData?.user?.id)
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("name,captain_id,created_by")
        .eq("id", teamId)
        .single();
      setteamData(teamData);
      if (teamError)
        throw new Error(`Error fetching team: ${teamError.message}`);
      setTeamName(teamData?.name || "Unknown Team");
      const { data, error } = await supabase.auth.getUser();
      if (teamData?.created_by === data?.user?.id) {
        setshowCaptain(true);
      }
      // ✅ Fetch team members
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId);

      if (teamMembersError)
        throw new Error(
          `Error fetching team members: ${teamMembersError.message}`
        );

      if (!teamMembers || teamMembers.length === 0) {
        console.log("No team members found.");
        return;
      }

      const userIds: string[] = teamMembers.map((member) => member.user_id);

      // ✅ Fetch user details from the `profiles` table
      const { data: usersData, error: usersError } = await supabase
        .from("profiles") // ✅ Query `profiles` instead of `auth.users`
        .select("*")
        .in("id", userIds);

      if (usersError)
        throw new Error(`Error fetching users: ${usersError.message}`);

      setPlayers(usersData);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="container mx-auto p-6">
      <Button onClick={() => router.back()} variant={"default"}>
        ⬅ Back
      </Button>
      <div className="flex justify-between">

        <h1 className="text-2xl font-bold mb-6">{teamName} - Players</h1>
        {showCaptain&&<Button onClick={()=>setshowRequestModal(true)}>Player Requests</Button>}
      </div>
      {isProfileShow&&
        <ProfileSettingsModalWithAnimation
          open={isProfileShow}
          onClose={() => setisProfileShow(false)}
          userId={activePlayer?.id}
        />
      }
      {
        showRequestModal&&<RequestModal open={showRequestModal} handleClose={()=>setshowRequestModal(false)} teamId={teamId}/>
      }
      {/* <Modal
        onClose={() => setisProfileShow(false)}
        open={isProfileShow}
        style={{ display: "flex", justifyContent: "center" }}
        // title=""
        // description=""
        // visible={true}
        // hideFooter
        // onConfirm={() => setisModalVisible(!isModalVisible)}
        // onCancel={() => setisModalVisible(!isModalVisible)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: "10px",

            p: 4,

            overflow: "scroll",
          }}
        >
          <div
            onClick={() => setisProfileShow(false)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <Typography id="modal-title" variant="h4" component="h2">
              Player Profile
            </Typography>
            <CloseIcon />
          </div>
          {activePlayer && (
            <>
              <table style={{ marginTop: 20, marginBottom: 20 }}>
                <tr>
                  <td>
                    {" "}
                    <strong>Player Name:</strong>{" "}
                  </td>
                  <td>{activePlayer?.full_name}</td>
                </tr>
                <tr>
                  <td>
                    {" "}
                    <strong>Player Email</strong>{" "}
                  </td>
                  <td>{activePlayer?.email}</td>
                </tr>
              </table>
              <Typography sx={{ mt: 2 }}></Typography>
            </>
          )}
        </Box>
      </Modal> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TableContainer
          sx={{ width: "100%", minWidth: "1000px" }}
          style={{ width: "100%" }}
        >
          <Table sx={{ minWidth: "1000px" }}>
            <TableHead>
              <TableRow
                sx={{
                  width: "100%",
                  backgroundColor: "#f4f6f8", // Light background for table header
                }}
              >
                <TableCell sx={{ fontWeight: "bold" }}>Index</TableCell>
                <TableCell sx={{ fontWeight: "bold", cursor: "pointer" }}>
                  Profile Picture
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Player Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Player Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Joined At</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Availability</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.length > 0 ? (
                players.map((player, index) => (
                  <TableRow
                    sx={{
                      width: "100%",
                      // Light background for table header
                    }}
                  >
                    {" "}
                    <TableCell>{index + 1}</TableCell>
                    <TableCell
                      onClick={() => {
                        // router.push(`teams/${player?.id}`);
                      }}
                    >
                      {" "}
                      <img
                        src={player?.profile_pic}
                        height={20}
                        alt={player?.full_name}
                        className=" h-16 w-16 rounded-lg mb-4 "
                      />
                    </TableCell>
                    <TableCell
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setactivePlayer(player);
                        setisProfileShow(true);
                      }}
                    >
                      {player.full_name}
                    </TableCell>
                    <TableCell>{player.email}</TableCell>
                    <TableCell>
                      {new Date(player?.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusDot isAvailable={player?.is_available} />
                    </TableCell>
                    {showCaptain && (
                      <TableCell>
                        <Button
                          onClick={() => updateRecord(player?.id)}
                          // onClick={()=>{setisModalVisible(true);setactiveTeam(team)}}
                          disabled={
                            teamData?.captain_id == player?.id ? true : false
                          }
                          variant={
                            teamData?.captain_id != player?.id
                              ? "default"
                              : "secondary"
                          }
                        >
                          {"Set Captain"}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <p>No players have joined this team yet.</p>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
