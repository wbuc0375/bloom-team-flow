import { useState, useMemo } from "react";
import { useBloom } from "@/contexts/BloomContext";
import { ArrowRight, Check, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayDates = [20, 21, 22, 23, 24, 25, 26];
const times = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

const PersonalCalendar = () => {
  const { availability, toggleAvailability, currentUser, members } = useBloom();
  const navigate = useNavigate();
  const [viewingMember, setViewingMember] = useState(currentUser);
  const [showCommon, setShowCommon] = useState(false);

  const memberAvail = availability[viewingMember] || {};
  const isOwnCalendar = viewingMember === currentUser;

  const commonSlots = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const day of days) {
      result[day] = times.filter(time =>
        members.every(m => (availability[m]?.[day] || []).includes(time))
      );
    }
    return result;
  }, [availability, members]);

  const totalCommon = Object.values(commonSlots).reduce((sum, s) => sum + s.length, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Personal Calendar</h1>
        <p className="text-muted-foreground mt-1">
          {showCommon
            ? "Showing time slots where all members are free."
            : isOwnCalendar
              ? "Click time slots to mark your availability."
              : `Viewing ${viewingMember}'s availability`}
        </p>
      </div>

      {/* Member tabs + common button */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {members.map((m) => (
          <button
            key={m}
            onClick={() => { setViewingMember(m); setShowCommon(false); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !showCommon && viewingMember === m
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {m}
          </button>
        ))}
        <Button
          variant={showCommon ? "default" : "outline"}
          size="sm"
          className="gap-2 rounded-full"
          onClick={() => setShowCommon(!showCommon)}
        >
          <Users className="w-4 h-4" />
          Common Free Time
        </Button>
      </div>

      {showCommon && (
        <div className={`bloom-card mb-4 ${totalCommon > 0 ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <p className="text-sm font-semibold text-foreground">
            {totalCommon > 0
              ? `✓ Found ${totalCommon} common free slot${totalCommon > 1 ? 's' : ''} across all ${members.length} members`
              : `No common free slots found across all ${members.length} members`}
          </p>
        </div>
      )}

      <div className="bloom-card overflow-x-auto mb-6">
        <p className="text-sm font-semibold text-foreground mb-3">April 20–26</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 text-muted-foreground font-medium w-24">Time</th>
              {days.map((day, i) => (
                <th key={day} className="p-2 text-center text-muted-foreground font-medium">
                  <div>{day}</div>
                  <div className="text-xs">{dayDates[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">{time}</td>
                {days.map((day) => {
                  if (showCommon) {
                    const isCommon = commonSlots[day]?.includes(time);
                    return (
                      <td key={day} className="p-1">
                        <div className={`w-full h-8 rounded-md border text-xs flex items-center justify-center ${
                          isCommon
                            ? "bg-primary/20 border-primary/40 text-primary font-semibold"
                            : "bg-muted/20 border-transparent"
                        }`}>
                          {isCommon ? <Check className="w-3 h-3" /> : ""}
                        </div>
                      </td>
                    );
                  }
                  const isAvail = (memberAvail[day] || []).includes(time);
                  return (
                    <td key={day} className="p-1">
                      <button
                        onClick={() => isOwnCalendar && toggleAvailability(currentUser, day, time)}
                        disabled={!isOwnCalendar}
                        className={`w-full h-8 rounded-md transition-all border text-xs flex items-center justify-center ${
                          isAvail
                            ? "bg-primary/15 border-primary/30 text-primary"
                            : "bg-muted/30 border-transparent hover:bg-muted/60"
                        } ${isOwnCalendar ? "cursor-pointer" : "cursor-default"}`}
                      >
                        {isAvail ? <Check className="w-3 h-3" /> : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate("/delegate")} className="gap-2">
          Next: Delegate Tasks <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PersonalCalendar;
