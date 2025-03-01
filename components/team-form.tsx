import { FormControlLabel, InputLabel, Modal, Switch } from "@mui/material";
import React, { useState } from "react";
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
  Typography,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Input } from "@supabase/ui";
import { createClient } from "@/utils/supabase/client";
const TeamForm = ({
  visible,
  onClose,
  isEditingMode,
  userId,
  activeTeam
}: {
  visible: boolean;
  onClose: () => void;
  isEditingMode: boolean;
  userId: string;
}) => {
  const [teamName, setteamName] = useState((activeTeam?.name)?(activeTeam?.name):'');
  const [logoUri, setlogoUri] = useState((activeTeam?.logo_url)?(activeTeam?.logo_url):'')
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isPublic, setisPublic] = useState((activeTeam?.is_public)?(activeTeam?.is_public):false);
  const [skillLeve, setskillLeve] = useState((activeTeam?.skill_level)?(activeTeam?.skill_level):'Beginner');
  const [region, setregion] = useState((activeTeam?.region)?(activeTeam?.region):"north_america");
  const [isAvailable, setisAvailable] = useState((activeTeam?.is_available)?(activeTeam?.is_available):false);
  const [gameType, setgameType] = useState((activeTeam?.game_type)?(activeTeam?.game_type):"fps");
  const [gameMode, setgameMode] = useState((activeTeam?.game_mode)?(activeTeam?.game_mode):"online");
  const [loading, setLoading] = useState(false);
  const regions = [
    { label: "North America", value: "north_america" },
    { label: "Europe", value: "europe" },
    { label: "Asia", value: "asia" },
    { label: "South America", value: "south_america" },
    { label: "Africa", value: "africa" },
    { label: "Oceania", value: "oceania" },
    { label: "Middle East", value: "middle_east" },
  ];
  const gameTypes = [
    { label: "FPS", value: "fps" },
    { label: "RPG", value: "rpg" },
    { label: "MOBA", value: "moba" },
    { label: "Battle Royale", value: "battle_royale" },
    { label: "Sports", value: "sports" },
    { label: "Racing", value: "racing" },
  ];
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };
  const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    setskillLeve(event.target.value);
  };

  const supabase = createClient();
  // Handle Create Team
  const handleUpdateTeam=async()=>{
    setLoading(true);

    try {
      if (!userId) throw new Error("User not authenticated");

      let logoUrl = logoUri;
      if (logoFile) {
        const filePath = `logos/${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
        const { error } = await supabase.storage
          .from("team-logos")
          .upload(filePath, logoFile);
        if (error) throw error;
        logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-logos/${filePath}`;
      }

      const { error } = await supabase.from("teams").update(
        {
          name: teamName,
          logo_url: logoUrl,
          is_public: isPublic,
          is_available: isAvailable,
          region: region,
          game_type: gameType,
          game_mode: gameMode,
          skill_level: skillLeve,
          created_by: userId,
        },
      ).eq('id',activeTeam?.id);

      if (error) throw error;
      alert("Team updated successfully!");
      onClose();
      setteamName("");
    } catch (error: any) {
      alert(`Failed to create team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }
  const handleCreateTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!userId) throw new Error("User not authenticated");

      let logoUrl = "";
      if (logoFile) {
        const filePath = `logos/${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
        const { error } = await supabase.storage
          .from("team-logos")
          .upload(filePath, logoFile);
        if (error) throw error;
        logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-logos/${filePath}`;
      }

      const { error } = await supabase.from("teams").insert([
        {
          name: teamName,
          logo_url: logoUrl,
          is_public: isPublic,
          is_available: isAvailable,
          region: region,
          game_type: gameType,
          game_mode: gameMode,
          skill_level: skillLeve,
          created_by: userId,
        },
      ]);

      if (error) throw error;
      alert("Team created successfully!");
      onClose();
      setteamName("");
    } catch (error: any) {
      alert(`Failed to create team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      onClose={onClose}
      open={visible}
      style={{ margin: "auto", overflow: "scroll" }}
      // title=""
      // description=""
      // visible={true}
      // hideFooter
      // onConfirm={() => setisModalVisible(!isModalVisible)}
      // onCancel={() => setisModalVisible(!isModalVisible)}
    >
      <Box>
        <div className=" h-full mt-10 ">
          <div className="max-w-lg  mx-auto p-6 bg-white rounded-lg">
            <div className="flex justify-between">
              {isEditingMode ? (
                <h2 className="text-xl font-semibold mb-4">Update a Team</h2>
              ) : (
                <h2 className="text-xl font-semibold mb-4">Create a Team</h2>
              )}
              <button onClick={onClose}>
                <CloseIcon />
              </button>
            </div>
            <form className="space-y-4">
              <InputLabel id="skill-level-label">Enter Team Name</InputLabel>
              <Input
                type="text"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setteamName(e.target.value)}
                className="w-full"
              />
              <InputLabel id="skill-level-label">Select Logo</InputLabel>
              <div className="flex justify-between">
              <img src={logoFile?logoFile:logoUri} height={100} width={100}/>
              <Input
              width={50}
                type="file"
                onChange={handleFileChange}
                className="w-[70%]"
              />
            
              </div>

              <InputLabel id="skill-level-label">Skill Level</InputLabel>
              <Select
                fullWidth
                sx={{ margin: 0, padding: 0 }}
                labelId="skill-level-label"
                value={skillLeve}
                onChange={handleChange}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
              <InputLabel id="region-label">Select Region</InputLabel>
              <Select
                fullWidth
                labelId="region-label"
                value={region}
                onChange={(e) => setregion(e.target.value)}
              >
                {regions.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
              <InputLabel id="game-mode-label">Game Mode</InputLabel>
              <Select
                fullWidth
                labelId="game-mode-label"
                value={gameMode}
                onChange={(e) => setgameMode(e.target.value)}
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
              <InputLabel id="game-type-label">Game Type</InputLabel>
              <Select
                fullWidth
                labelId="game-type-label"
                value={gameType}
                onChange={(e) => setgameType(e.target.value)}
              >
                {gameTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              <div className="flex justify-between items-center">
                <InputLabel id="region-label">Availability Status</InputLabel>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAvailable}
                      onChange={(e) => setisAvailable(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={isAvailable ? "Available" : "Not Available"}
                />
              </div>
              <div className="flex justify-between items-center">
                <InputLabel id="region-label">
                  Profile Privacy Status
                </InputLabel>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setisPublic(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={isPublic ? "Public" : "Private"}
                />
              </div>
            </form>
            {isEditingMode?<Button
              type="primary"
              className="w-full"
              onClick={handleUpdateTeam}
              disabled={loading}
            >
              {"Update Team"}
            </Button>:<Button
              type="primary"
              className="w-full"
              onClick={handleCreateTeam}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Team"}
            </Button>}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default TeamForm;
