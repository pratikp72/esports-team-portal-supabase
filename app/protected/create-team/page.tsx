"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const supabase = createClient();

const CreateTeam = () => {
  const [teamName, setTeamName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.user?.id) {
        throw new Error("User not authenticated");
      }
  
      const userId = user.user.id; // Get the authenticated user's UUID
  
      let logoUrl = "";
      if (logoFile) {
        const sanitizedFileName = logoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const filePath = `logos/${Date.now()}_${sanitizedFileName}`;
  
        const { data, error } = await supabase.storage
          .from("team-logos")
          .upload(filePath, logoFile, { cacheControl: "3600", upsert: false });
  
        if (error) {
          throw error;
        }
  
        logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-logos/${filePath}`;
      }
  
      // Insert into database with correct UUID
      const { data, error } = await supabase.from("teams").insert([
        { name: teamName, logo_url: logoUrl, created_by: userId },
      ]);
  
      if (error) {
        throw error;
      }
  
      alert("Team created successfully!");
    } catch (error: any) {
      alert(`Failed to create team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create a Team</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full"
        />
        <Input type="file" onChange={handleFileChange} className="w-full" />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Team"}
        </Button>
      </form>
    </div>
  );
};

export default CreateTeam;
