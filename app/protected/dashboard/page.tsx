"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import FilterModal from "@/components/FilterModal";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ProfileSettingsModal from "@/components/ProfileModal";
import TeamForm from "@/components/team-form";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import InviteModal from "@/components/invite-user";
import { useUserProfileModalStore } from "@/store/user-profile-modal";
// import { createClient } from "@supabase/supabase-js";

const supabase =createClient()

interface Team {
  id: string;
  name: string;
  logo_url: string;
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditingMode, setisEditingMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModal, setinviteModal] = useState(false)
  const router = useRouter();

  const isProfileModalOpen = useUserProfileModalStore((state) => state.isOpen);
  const closeUserProfileModal = useUserProfileModalStore((state) => state.closeUserProfileModal);

  useEffect(() => {
    console.log("isProfileModalOpen", isProfileModalOpen);
    if(isProfileModalOpen) {
      setOpen(true);
    }
  }, [isProfileModalOpen]);

  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    const { data, error } = await supabase
    .from("teams")
    .select("id, name, logo_url");
    if (error) console.error("Error fetching teams:", error);
    else setTeams(data);

    setIsLoadingTeams(false);
  };
  useEffect(() => {

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      else console.error("Error fetching user ID:", error?.message);
    };

    fetchUser();
    fetchTeams();
  }, []);

  const fetchTeamsWithFilters = async (filters: any = {}) => {
    let query = supabase.from("teams").select("id, name, logo_url");

    if (filters.game_type) query = query.eq("game_type", filters.game_type);
    if (filters.skill_level)
      query = query.eq("skill_level", filters.skill_level);
    if (filters.region) query = query.eq("region", filters.region);
    if (filters.is_available) query = query.eq("is_available", true);

    const { data, error } = await query;
    if (error) console.error("Error fetching teams:", error);
    else setTeams(data);
  };

  const handleApplyFilters = (filters: any) => {
    fetchTeamsWithFilters(filters);
    setIsFilterModalOpen(false);
  };

  async function sendInvite(email: string) {
    const response = await fetch("/api/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, isAdmin: true }), // Ensure only admin can call
    });
  
    const data = await response.json();
    if (response.ok) {
      toast.success("Email sent successfully!");
    } else {
      toast.error(`Error: ${data.error}`);
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    if (!userId) {
      alert("Please log in to join a team.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("join_requests")
        .insert([{ team_id: teamId, member_id: userId }]);
      if (error) throw error;
      toast.success("Join request sent successfully!");
      // alert("Join request sent successfully!");
    } catch {
      toast.error("Failed to send join request.");
      // alert("Failed to send join request.");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(async (query) => {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, logo_url")
      .ilike("name", `%${query}%`);
    if (!error) setTeams(data);
  }, 500);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    debouncedSearch(event.target.value);
  };

  return (
    <div className="container mx-auto p-6 w-full">
      <div className="w-full flex justify-between">
        <h1 className="text-3xl font-bold mb-6">Team Dashboard</h1>
        <div className="gap-10 flex">
          <TextField
            label="Search Teams"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            className="mr-4"
          />
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {/* <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setOpen(true)}
            >
              Profile
            </Button> */}
            <ProfileSettingsModal
              open={open}
              onClose={() => {closeUserProfileModal(); setOpen(false)}}
              userId={userId || ""}
            />

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filters
            </Button>
            <FilterModal
              open={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              onApply={handleApplyFilters}
            />

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("my-teams")}
            >
              Team I Joined
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setisModalVisible(true)}
            >
              Create Team
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("team-list")}
            >
              My Teams
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>setinviteModal(true)}
            >
              invite user
            </Button>
          </div>
        </div>
      </div>

      <TableContainer sx={{ width: "100%", minWidth: "1000px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Index</TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>Team Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {isLoadingTeams ?
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="text-center">Loading Teams...</TableCell>
            </TableRow>
          </TableBody>
           :<TableBody>
            {teams.map((team, index) => (
              <TableRow key={team.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    router.push(`teams/${team?.id}`);
                  }}
                >
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-16 w-16 rounded-lg"
                  />
                </TableCell>
                <TableCell>{team.name}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Joining..." : "Join Team"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
        </Table>
      </TableContainer>
      {inviteModal&&<InviteModal open={inviteModal} handleClose={()=>setinviteModal(false)}/>}
      {isModalVisible && (
        <TeamForm
          userId={userId || ""}
          isEditingMode={isEditingMode}
          visible={isModalVisible}
          onClose={() => {setisModalVisible(false); fetchTeams();}}
        />
      )}
    </div>
  );
}
