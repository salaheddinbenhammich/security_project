import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, AlertTriangle } from "lucide-react";

export default function ConfirmArchiveDialog({
  open,
  onOpenChange,
  onConfirm,
  ticketNumber,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-md">
              <Archive className="w-5 h-5 text-white" />
            </div>
            Annuler ce ticket ?
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Attention</p>
              <p>
                Le ticket {ticketNumber && <strong>{ticketNumber}</strong>} sera marqué comme <strong>ANNULÉ</strong>.
              </p>
              <p className="mt-2 text-xs text-amber-700">
                Il n'apparaîtra plus dans les tickets actifs.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-slate-200"
          >
            Non, garder
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            <Archive className="w-4 h-4 mr-2" />
            Oui, annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}