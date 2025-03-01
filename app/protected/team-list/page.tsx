"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const supabase = createClient();

interface Team {
  id: string;
  name: string;
  logo_url: string;
}
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import { useRouter } from "next/navigation";
import TeamForm from "@/components/team-form";
export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [activeTeam, setactiveTeam] = useState({})
  const router = useRouter();
  // Fetch all teams from Supabase
  useEffect(() => {
    const fetchTeams = async (userIdd: any) => {
      setIsLoadingTeams(true);
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("created_by", userIdd);
      if (error) {
        console.error("Error fetching teams:", error);
      } else {
        setTeams(data);
      }

      setIsLoadingTeams(false);
    };

    // Get current user ID
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        fetchTeams(data?.user?.id);
        setUserId(data?.user?.id || null);
      }
    };

    getUser();
  }, [isModalVisible]);

  // Handle Join Button Click
  const handleJoinTeam = async (teamId: string) => {
    if (!userId) {
      alert("Please log in to join a team.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("team_members")
        .insert([{ team_id: teamId, user_id: userId }]);
      if (error) throw error;
      alert("Joined the team successfully!");
    } catch (error: any) {
      console.error("Error joining team:", error.message);
      alert("Failed to join the team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between">

     
      <h1 className="text-2xl font-bold mb-6">Teams</h1>
     
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <TableCell
                  sx={{ fontWeight: "bold", cursor: "pointer" }}
                ></TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Team Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                {/* <TableCell sx={{ fontWeight: "bold" }}>Joined At</TableCell> */}
                <TableCell sx={{ fontWeight: "bold" }}></TableCell>
              </TableRow>
            </TableHead>

            {isLoadingTeams ?
              <TableBody>
                <TableRow>
                <TableCell className="text-center">Loading...</TableCell>
                </TableRow>
              </TableBody> 
            : <TableBody>
              {teams?.map((team, index) => (
                <TableRow
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#f9fafb", // Alternate row color for better readability
                    },
                  }}
                  key={team.id}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell
                    onClick={() => {
                      router.push(`teams/${team?.id}`);
                    }}
                  >
                    {" "}
                    <img
                      src={team.logo_url}
                      height={20}
                      alt={team.name}
                      className=" h-16 w-16 rounded-lg mb-4 "
                    />
                  </TableCell>
                  <TableCell>{team?.name}</TableCell>
                  <TableCell>
                    {" "}
                    <Button
                      onClick={()=>{setisModalVisible(true);setactiveTeam(team)}}
                      disabled={loading}
                      className=" bg-blue-600 hover:bg-blue-700 text-white "
                    >
                      {"Edit Team"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>}
          </Table>
        </TableContainer>
      </div>
      {isModalVisible && (
        <TeamForm
        activeTeam={activeTeam}
          visible={isModalVisible}
          onClose={() => setisModalVisible(false)}
          isEditingMode={true}
          userId={userId}
        />
      )}
    </div>
  );
}
