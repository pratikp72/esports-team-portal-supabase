import React, { useState } from "react";
import { Modal, Box, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Stack, SelectChangeEvent } from "@mui/material";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ open, onClose, onApply }) => {
  const [filters, setFilters] = useState({
    game_type: "",
    skill_level: "",
    region: "",
    is_available: false,
  });

  const handleChange = (event: SelectChangeEvent<string>) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name as string]: event.target.value,
    }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 4, bgcolor: "white", mx: "auto", mt: 10, borderRadius: 2 }}>
        <h2>Filter Teams</h2>

        {/* Game Type */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Game Type</InputLabel>
          <Select name="game_type" value={filters.game_type} onChange={handleChange}>
            {["fps", "rpg", "moba", "battle_royale", "sports", "racing"].map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Skill Level */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Skill Level</InputLabel>
          <Select name="skill_level" value={filters.skill_level} onChange={handleChange}>
            {["Beginner", "Intermediate", "Advanced"].map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Region */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Region</InputLabel>
          <Select name="region" value={filters.region} onChange={handleChange}>
            {["north_america", "europe", "asia", "south_america", "africa", "oceania", "middle_east"].map((region) => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Availability */}
        <FormControlLabel
          control={<Checkbox checked={filters.is_available} onChange={(e) => setFilters({ ...filters, is_available: e.target.checked })} />}
          label="Only show available teams"
          sx={{ mt: 2 }}
        />

        {/* Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={() => onApply(filters)}>
            Apply
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default FilterModal;
