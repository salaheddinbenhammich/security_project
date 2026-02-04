import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ResolutionDialog({ open, onOpenChange, onConfirm }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return; 
    
    onConfirm(text);
    setText("");     
    onOpenChange(false); 
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la résolution</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label>Quelle solution a été apportée ?</Label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Redémarrage du service, Changement de câble..."
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Valider la résolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}