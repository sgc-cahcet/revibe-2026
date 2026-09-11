import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  BadgeCheck,
  Clock,
  IndianRupee,
  Search,
  RefreshCw,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  Clipboard,
  Check,
  Filter,
  UsersRound,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../services/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/*
=========================================================
REVIBE '26 — COORDINATOR DASHBOARD
=========================================================

Coordinator:
- Sees registrations for the assigned event only.
- Can search and filter registrations.
- Can view team/participant details.
- Can view payment information.
- Cannot verify payments.

IMPORTANT DATABASE FIX:
The `events` table uses `name`, NOT `event_name`.

Coordinator assignment:
event_staff.event_id -> events.id
event_staff.role = "coordinator"

The assigned event is resolved from event_staff, then its
slug is used to match overall.selected_events.
=========================================================
*/

const EVENT_LABELS = {
  "paper-presentation": "Paper Presentation",
  "mini-hackathon": "Mini Hackathon",
  "technical-quiz": "Technical Quiz",
  "coding-debugging": "Coding & Debugging",
  "shark-tank": "Shark Tank",
  "prompt-wars": "Prompt Wars",
  mehandi: "Mehandi",
  "cooking-without-fire": "Cooking Without Fire",
  "ipl-auction": "IPL Auction",
  "art-painting": "Art & Painting",
  connection: "Connection",
  chess: "Chess",
  "free-fire": "Free Fire",
};
const COORDINATOR_NAMES = {
  "revibe26_ppt@gmail.com": "Raja",
  "revibe26_mini_hackathon@gmail.com": "Abuzar",
  "revibe26_technical_quiz@gmail.com": "Aasif",
  "revibe26_coding_debugging@gmail.com": "Gaffoor",
  "revibe26_shark_tank@gmail.com": "Gokul",
  "revibe26_prompt_wars@gmail.com": "Yasar",
  "revibe26_connections@gmail.com": "Banusree",
  "revibe26_chess@gmail.com": "Abhishek",
  "revibe26_free_fire@gmail.com": "Affan",
  "revibe26_mehandi@gmail.com": "Banusree",
  "revibe26_cooking_without_fire@gmail.com": "Swetha",
  "revibe26_art_painting@gmail.com": "Akshaya",
  "revibe26_ipl_auction@gmail.com": "Mudassir",
};

const DEFAULT_COORDINATOR_EVENT = "paper-presentation";

/* ======================================================
   HELPERS
====================================================== */

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function safeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventLabel(event) {
  if (!event) return "Unknown Event";

  if (typeof event === "string") {
    return (
      EVENT_LABELS[normalize(event)] ||
      event
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
  }

  return (
    EVENT_LABELS[normalize(event?.slug)] ||
    event?.name ||
    event?.event_name ||
    event?.eventName ||
    event?.title ||
    event?.event_title ||
    event?.eventTitle ||
    event?.slug ||
    event?.event_id ||
    event?.eventId ||
    "Unknown Event"
  );
}

function normalizeSelectedEvent(event = {}) {
  if (typeof event === "string") {
    return {
      event_name: event,
      slug: event,
      participant_count: null,
    };
  }

  return {
    event_name:
      event?.name ||
      event?.event_name ||
      event?.eventName ||
      event?.title ||
      event?.event_title ||
      event?.eventTitle ||
      event?.slug ||
      event?.event_id ||
      event?.eventId ||
      "Unknown Event",

    slug:
      event?.slug ||
      event?.event_slug ||
      event?.eventSlug ||
      event?.event_id ||
      event?.eventId ||
      "",

    participant_count:
      event?.participant_count ??
      event?.participantCount ??
      event?.participants_count ??
      event?.participantsCount ??
      null,
  };
}

function getSelectedEvents(row) {
  return safeArray(row?.selected_events);
}

function getEventNames(row) {
  return getSelectedEvents(row)
    .map((event) => normalizeSelectedEvent(event).event_name)
    .filter(Boolean);
}

function registrationBelongsToEvent(row, coordinatorEvent) {
  if (!coordinatorEvent) return false;

  const target = normalize(coordinatorEvent);

  return getSelectedEvents(row).some((event) => {
    const normalizedEvent = normalizeSelectedEvent(event);

    return (
      normalize(normalizedEvent.slug) === target ||
      normalize(normalizedEvent.event_name) === target
    );
  });
}

/* ======================================================
   PARTICIPANTS
====================================================== */

function normalizeParticipant(participant = {}) {
  return {
    full_name:
      participant?.full_name ||
      participant?.fullName ||
      participant?.name ||
      participant?.student_name ||
      participant?.studentName ||
      "",

    email:
      participant?.email ||
      participant?.student_email ||
      participant?.studentEmail ||
      "",

    phone:
      participant?.phone ||
      participant?.mobile ||
      participant?.mobile_number ||
      participant?.mobileNumber ||
      participant?.student_phone ||
      participant?.studentPhone ||
      "",

    college_name:
      participant?.college_name ||
      participant?.college ||
      participant?.collegeName ||
      "",

    department:
      participant?.department ||
      participant?.dept ||
      "",

    year:
      participant?.year ||
      participant?.study_year ||
      participant?.studyYear ||
      "",

    role:
      participant?.role ||
      participant?.member_role ||
      "member",
  };
}

function getAllParticipants(row) {
  const teamMembers = safeArray(row?.team_members);

  if (teamMembers.length > 0) {
    return teamMembers.map(normalizeParticipant);
  }

  return [
    normalizeParticipant({
      full_name: row?.full_name,
      email: row?.email,
      phone: row?.phone,
      college_name: row?.college_name,
      department: row?.department,
      year: row?.year,
      role: "leader",
    }),
  ];
}
function getEventParticipants(row, coordinatorEvent) {
  const selectedEvents = getSelectedEvents(row);

  if (!coordinatorEvent) {
    return getAllParticipants(row);
  }

  const target = normalize(coordinatorEvent);

  const matchingEvent = selectedEvents.find((event) => {
    const normalizedEvent =
      normalizeSelectedEvent(event);

    return (
      normalize(normalizedEvent.slug) === target ||
      normalize(normalizedEvent.event_name) === target ||
      normalize(normalizedEvent.event_id) === target
    );
  });

  if (
    matchingEvent &&
    Array.isArray(matchingEvent.participants) &&
    matchingEvent.participants.length > 0
  ) {
    return matchingEvent.participants.map(
      normalizeParticipant
    );
  }

  /*
   * Fallback for an individual registration
   * if event participant data is unavailable.
   */
  if (
    matchingEvent &&
    Number(matchingEvent.participant_count) === 1
  ) {
    return [
      normalizeParticipant({
        full_name: row?.full_name,
        email: row?.email,
        phone: row?.phone,
        college_name: row?.college_name,
        department: row?.department,
        year: row?.year,
        role: "leader",
      }),
    ];
  }

  return [];
}
function getEventLeader(row, coordinatorEvent) {
  const participants =
    getEventParticipants(
      row,
      coordinatorEvent
    );

  return (
    participants.find(
      (participant) =>
        normalize(participant?.role) === "leader"
    ) ||
    participants[0] ||
    normalizeParticipant()
  );
}

function getLeader(row) {
  const participants = getAllParticipants(row);

  return (
    participants.find(
      (participant) => normalize(participant?.role) === "leader"
    ) ||
    participants[0] ||
    normalizeParticipant()
  );
}

/* ======================================================
   PAYMENT
====================================================== */

function isPaid(row) {
  return [
    "paid",
    "verified",
    "success",
    "successful",
    "completed",
  ].includes(normalize(row?.payment_status));
}

function isPending(row) {
  return [
    "pending",
    "pending_payment",
    "awaiting_verification",
  ].includes(normalize(row?.payment_status));
}

/* ======================================================
   EXPORT TO PDF
========================================================= */

function exportToPDF(rows, eventLabel) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(239, 68, 68);
  doc.text("REVIBE '26", pageWidth / 2, 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(eventLabel || "All Events", pageWidth / 2, 26, { align: "center" });

  const tableData = [];
  let serialNo = 1;

  rows.forEach((row) => {
    const participants = getAllParticipants(row);
    const list = participants.length > 0 ? participants : [normalizeParticipant({
      full_name: row?.full_name,
      email: row?.email,
      phone: row?.phone,
      college_name: row?.college_name,
      department: row?.department,
    })];

    list.forEach((p) => {
      tableData.push([
        serialNo,
        p.full_name || p.name || "—",
        p.college_name || "—",
        p.department || "—",
        p.phone || "—",
        isPaid(row) ? "Paid" : "Pending",
      ]);
      serialNo++;
    });
  });

  autoTable(doc, {
    startY: 32,
    head: [["Serial No", "Name", "College Name", "Department", "Phone Number", "Paid Status"]],
    body: tableData,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
    },
    headStyles: {
      fillColor: [239, 68, 68],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 50 },
      2: { cellWidth: 60 },
      3: { cellWidth: 40 },
      4: { cellWidth: 32 },
      5: { cellWidth: 25 },
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 5) {
        const val = String(data.cell.raw);
        if (val === "Paid") {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 10, right: 10 },
  });

  const filename = eventLabel
    ? `revibe26-${eventLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-registrations.pdf`
    : "revibe26-all-registrations.pdf";
  doc.save(filename);
}

/* ======================================================
   SMALL UI COMPONENTS
===================================================== */

function CoordinatorStatCard({ label, value, icon, tone = "red" }) {
  return (
    <div className={`coordinator-stat-card coordinator-tone-${tone}`}>
      <div>
        <p className="coordinator-stat-label">{label}</p>
        <p className="coordinator-stat-value">
          {value === null ? (
            <span className="coordinator-stat-skeleton" />
          ) : (
            value
          )}
        </p>
      </div>
      <div className="coordinator-stat-icon">{icon}</div>
    </div>
  );
}

function PaymentBadge({ row }) {
  const paid = isPaid(row);

  return (
    <span
      className={`coordinator-payment-badge ${
        paid
          ? "coordinator-payment-paid"
          : "coordinator-payment-pending"
      }`}
    >
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

function RegistrationTypeBadge({ type }) {
  const team = normalize(type) === "team";

  return (
    <span
      className={`coordinator-type-badge ${
        team
          ? "coordinator-type-team"
          : "coordinator-type-individual"
      }`}
    >
      {team ? "Team" : "Individual"}
    </span>
  );
}

function DetailRow({ label, value, onCopy, copied }) {
  return (
    <div className="coordinator-detail-row">
      <span className="coordinator-detail-label">{label}</span>
      <span className="coordinator-detail-value">
        {value}
        {onCopy && (
          <button
            type="button"
            className="coordinator-copy-btn"
            onClick={onCopy}
          >
            {copied ? <Check size={12} /> : <Clipboard size={12} />}
          </button>
        )}
      </span>
    </div>
  );
}

function MemberDetail({ label, value, onCopy, copied }) {
  return (
    <div className="coordinator-member-detail">
      <small>{label}</small>
      <div>
        <span>{value}</span>
        {onCopy && (
          <button
            type="button"
            className="coordinator-copy-btn"
            onClick={onCopy}
          >
            {copied ? <Check size={12} /> : <Clipboard size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   REGISTRATION MODAL
====================================================== */
function CoordinatorRegistrationModal({
  row,
  coordinatorEvent,
  onClose,
  onCopyPhone,
  copiedPhone,
}) {
  const participants =
    getEventParticipants(
      row,
      coordinatorEvent
    );

  const leader =
    getEventLeader(
      row,
      coordinatorEvent
    );

  const members = participants.filter(
    (participant) => normalize(participant?.role) !== "leader"
  );

  const isTeam =
  participants.length > 1;

  const events = getSelectedEvents(row);

  return (
    <div className="coordinator-modal-overlay" onClick={onClose}>
      <div
        className="coordinator-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="coordinator-modal-header">
          <div>
            <p className="coordinator-modal-eyebrow">
              Registration Details
            </p>

            <h2>
              {isTeam ? "Team Registration" : "Individual Registration"}
            </h2>

            <div className="coordinator-modal-badges">
              <span className="coordinator-modal-event">
                {getEventLabel(coordinatorEvent)}
              </span>
              <PaymentBadge row={row} />
            </div>
          </div>

          <button
            type="button"
            className="coordinator-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>

        <div className="coordinator-modal-body">
          <section className="coordinator-modal-section">
            <p className="coordinator-section-title">Registration</p>

            <DetailRow
              label="Registration Number"
              value={row?.registration_number || "—"}
            />

            <DetailRow
              label="Registration Type"
              value={<RegistrationTypeBadge type={row?.registration_type} />}
            />

            <DetailRow
              label="Registration Status"
              value={row?.registration_status || "—"}
            />

            <DetailRow
              label="Registered At"
              value={formatDate(row?.registered_at || row?.created_at)}
            />

            <DetailRow label="Participants" value={participants.length} />

            {isTeam && row?.team_name && (
  <DetailRow
    label="Team Name"
    value={row.team_name}
  />
)}
          </section>

          <section className="coordinator-modal-section">
            <p className="coordinator-section-title">
              {isTeam ? "Team Lead" : "Participant Details"}
            </p>

            <DetailRow
              label="Name"
              value={leader.full_name || row?.full_name || "—"}
            />

            <DetailRow
              label="Email"
              value={leader.email || row?.email || "—"}
            />

            <DetailRow
              label="Phone"
              value={leader.phone || row?.phone || "—"}
              onCopy={
                leader.phone || row?.phone
                  ? () => onCopyPhone(leader.phone || row?.phone)
                  : null
              }
              copied={
                copiedPhone ===
                String(leader.phone || row?.phone || "")
              }
            />

            <DetailRow
              label="College"
              value={leader.college_name || row?.college_name || "—"}
            />

            <DetailRow
              label="Department"
              value={leader.department || row?.department || "—"}
            />

            <DetailRow
              label="Year"
              value={leader.year || row?.year || "—"}
            />
          </section>

          {isTeam && (
            <section className="coordinator-modal-section">
              <div className="coordinator-section-title-row">
                <p className="coordinator-section-title">Team Members</p>
                <span className="coordinator-member-count">
                  {members.length} {members.length === 1 ? "Member" : "Members"}
                </span>
              </div>

              {members.length === 0 ? (
                <div className="coordinator-no-members">
                  No additional team members found.
                </div>
              ) : (
                <div className="coordinator-member-list">
                  {members.map((member, index) => (
                    <div
                      className="coordinator-member-card"
                      key={`${member.email || "member"}-${index}`}
                    >
                      <div className="coordinator-member-top">
                        <span className="coordinator-member-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <strong>{member.full_name || "Unnamed Member"}</strong>
                          <small>
                            {member.department || "—"} • {member.year || "—"}
                          </small>
                        </div>
                      </div>

                      <div className="coordinator-member-details">
                        <MemberDetail
                          label="Email"
                          value={member.email || "—"}
                        />

                        <MemberDetail
                          label="Phone"
                          value={member.phone || "—"}
                          onCopy={
                            member.phone
                              ? () => onCopyPhone(member.phone)
                              : null
                          }
                          copied={copiedPhone === String(member.phone || "")}
                        />

                        <MemberDetail
                          label="College"
                          value={member.college_name || "—"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          

          <section className="coordinator-modal-section">
            <p className="coordinator-section-title">Payment Details</p>

            <DetailRow
              label="Payment Status"
              value={<PaymentBadge row={row} />}
            />

            <DetailRow
              label="Payment Method"
              value={row?.payment_method || "—"}
            />

            <DetailRow
              label="Total Amount"
              value={formatCurrency(row?.total_amount)}
            />

          

            <DetailRow
              label="Verified At"
              value={formatDate(row?.verified_at)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function CoordinatorEmptyState({ searchActive }) {
  return (
    <div className="coordinator-empty">
      <Users size={40} />
      <h3>
        {searchActive
          ? "No matching registrations"
          : "No registrations found"}
      </h3>
      <p>
        {searchActive
          ? "Try changing the search or filters."
          : "There are currently no registrations for this event."}
      </p>
    </div>
  );
}

function CoordinatorSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <div className="coordinator-table-row" key={item}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
            <span className="coordinator-skeleton-line" key={cell} />
          ))}
        </div>
      ))}
    </>
  );
}

function CoordinatorMobileSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          className="coordinator-mobile-card coordinator-mobile-skeleton"
          key={item}
        >
          <span />
          <span />
          <span />
        </div>
      ))}
    </>
  );
}

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function CoordinatorDashboard() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [coordinatorEvent, setCoordinatorEvent] = useState(
    DEFAULT_COORDINATOR_EVENT
  );
  const [coordinatorName, setCoordinatorName] = useState("Coordinator");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState("");

  /* ======================================================
     LOAD COORDINATOR ASSIGNMENT

     IMPORTANT:
     event_staff uses:
       profile_id
       event_id
       role

     events uses:
       id
       slug
       name

     Do NOT query events.event_name.
  ====================================================== */

  const loadCoordinatorInfo = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("No authenticated user found.");
    }

    const { data: staff, error: staffError } = await supabase
      .from("event_staff")
      .select(`
        id,
        profile_id,
        event_id,
        role
      `)
      .eq("profile_id", user.id)
      .eq("role", "coordinator")
      .maybeSingle();

    if (staffError) throw staffError;

    if (!staff) {
      throw new Error(
        "No coordinator event assignment was found for this account."
      );
    }

    if (!staff.event_id) {
      throw new Error(
        "Coordinator account exists, but no event is assigned to it."
      );
    }

    const metadata = user.user_metadata || {};

    const coordinatorName =
  COORDINATOR_NAMES[user.email?.toLowerCase()] || "Coordinator";

setCoordinatorName(coordinatorName);

    /*
     * FIX:
     * events.name is the real column.
     */
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(`
        id,
        slug,
        name
      `)
      .eq("id", staff.event_id)
      .maybeSingle();

    if (eventError) throw eventError;

    if (!event) {
      throw new Error("The assigned event could not be found.");
    }

    const assignedEvent =
      event.slug ||
      event.name ||
      staff.event_id;

    setCoordinatorEvent(assignedEvent);

    return assignedEvent;
  }, []);

  /* ======================================================
     FETCH REGISTRATIONS
  ====================================================== */

  const fetchRegistrations = useCallback(
    async ({ showRefresh = false } = {}) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const { data, error: overallError } = await supabase
          .from("overall")
          .select(`
            id,
            registration_number,
            registration_type,
            team_name,
            registration_status,

            full_name,
            email,
            phone,

            college_name,
            department,
            year,

            selected_events,
            team_members,

            total_amount,

            payment_status,
            payment_method,
            transaction_reference,
            payment_screenshot_url,

            paid_at,
            verified_at,
            payment_notes,

            registered_at,
            created_at,
            updated_at
          `)
          .order("created_at", {
            ascending: false,
          });

        if (overallError) throw overallError;

        setRegistrations(safeArray(data));
      } catch (fetchError) {
        console.error("Coordinator dashboard error:", fetchError);

        setRegistrations([]);

        const message = String(fetchError?.message || "");

        if (message.toLowerCase().includes("permission denied")) {
          setError(
            'Permission denied reading "overall". The authenticated coordinator role needs SELECT permission on public.overall.'
          );
        } else {
          setError(
            message || "Unable to load coordinator dashboard."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ======================================================
     INITIALIZATION

     FIX:
     Do not call the entire initialization again for
     INITIAL_SESSION or TOKEN_REFRESHED. Supabase can emit
     these automatically and doing the work twice causes
     duplicate requests/races.
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    async function initializeDashboard() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user) {
          if (mounted) {
            setLoading(false);
            navigate("/login", { replace: true });
          }
          return;
        }

        const assignedEvent = await loadCoordinatorInfo();

        if (mounted && assignedEvent) {
          await fetchRegistrations();
        }
      } catch (initError) {
        console.error("Coordinator initialization error:", initError);

        if (mounted) {
          setLoading(false);
          setError(
            initError?.message ||
              "Unable to initialize coordinator dashboard."
          );
        }
      }
    }

    initializeDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((authEvent, session) => {
      if (!mounted) return;

      if (authEvent === "SIGNED_OUT" || !session?.user) {
        setRegistrations([]);
        setLoading(false);

        navigate("/login", {
          replace: true,
        });
      }

      /*
       * Intentionally ignore:
       * INITIAL_SESSION
       * TOKEN_REFRESHED
       * SIGNED_IN
       *
       * The initial session is handled above. This prevents
       * duplicate event_staff/events/overall requests.
       */
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, loadCoordinatorInfo, fetchRegistrations]);

  /* ======================================================
     EVENT-SCOPED DATA
  ====================================================== */

  const eventRegistrations = useMemo(() => {
    if (!coordinatorEvent) return [];

    return registrations.filter((row) =>
      registrationBelongsToEvent(row, coordinatorEvent)
    );
  }, [registrations, coordinatorEvent]);

  /* ======================================================
     SEARCH + FILTERS
  ====================================================== */

  const filteredRegistrations = useMemo(() => {
    const query = normalize(searchTerm);

    return eventRegistrations.filter((row) => {
      const participants = getAllParticipants(row);

      const participantText = participants
        .map((participant) =>
          [
            participant.full_name,
            participant.email,
            participant.phone,
            participant.college_name,
            participant.department,
            participant.year,
            participant.role,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ");

      const searchableText = [
        row.registration_number,
        row.registration_type,
        row.team_name,
        row.full_name,
        row.email,
        row.phone,
        row.college_name,
        row.department,
        row.year,
        row.payment_status,
        row.payment_method,
        row.transaction_reference,
        getEventNames(row).join(" "),
        participantText,
      ]
        .filter(Boolean)
        .join(" ");

      if (query && !normalize(searchableText).includes(query)) {
        return false;
      }

      if (paymentFilter === "paid" && !isPaid(row)) {
        return false;
      }

      if (paymentFilter === "pending" && !isPending(row)) {
        return false;
      }

      if (
        typeFilter !== "all" &&
        normalize(row.registration_type) !== normalize(typeFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    eventRegistrations,
    searchTerm,
    paymentFilter,
    typeFilter,
  ]);

  /* ======================================================
     STATS
  ====================================================== */

  const stats = useMemo(() => {
    let totalRegistrations = 0;
    let totalParticipants = 0;
    let paidParticipants = 0;
    let pendingParticipants = 0;
    let totalCollection = 0;
    let pendingAmount = 0;

    eventRegistrations.forEach((row) => {
      const participantCount =
  getEventParticipants(
    row,
    coordinatorEvent
  ).length || 1;

      totalRegistrations += 1;
      totalParticipants += participantCount;

      if (isPaid(row)) {
        paidParticipants += participantCount;
        totalCollection += Number(row.total_amount || 0);
      } else {
        pendingParticipants += participantCount;
        pendingAmount += Number(row.total_amount || 0);
      }
    });

    return {
      totalRegistrations,
      totalParticipants,
      paidParticipants,
      pendingParticipants,
      totalCollection,
      pendingAmount,
    };
  }, [eventRegistrations]);

  /* ======================================================
     ACTIONS
  ====================================================== */

  async function handleCopyPhone(phone) {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(String(phone));
      setCopiedPhone(String(phone));

      window.setTimeout(() => {
        setCopiedPhone("");
      }, 1600);
    } catch (copyError) {
      console.error("Unable to copy phone:", copyError);
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setPaymentFilter("all");
    setTypeFilter("all");
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (logoutError) {
      console.error("Logout error:", logoutError);
    }

    navigate("/login");
  }

  const filtersActive =
    Boolean(searchTerm) ||
    paymentFilter !== "all" ||
    typeFilter !== "all";

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <>
      <main className="coordinator-page">
        <div className="coordinator-shell">
          <section className="coordinator-hero">
            <div>
              <p className="coordinator-eyebrow">REVIBE '26</p>

              <h1 className="coordinator-title">
                Coordinator Dashboard
              </h1>

              <div className="coordinator-badges">

  <span className="coordinator-badge coordinator-badge-event">
    {getEventLabel(coordinatorEvent)}
  </span>

  <span className="coordinator-badge coordinator-badge-welcome">
    Welcome...... {coordinatorName.split(/\s+/)[0]}
  </span>

</div>
            </div>

            <div className="coordinator-hero-actions">
              <button
                type="button"
                className="coordinator-btn coordinator-btn-secondary"
                onClick={() =>
                  exportToPDF(filteredRegistrations, getEventLabel(coordinatorEvent))
                }
              >
                Export PDF
              </button>

              <button
                type="button"
                className="coordinator-btn coordinator-btn-secondary"
                onClick={() =>
                  fetchRegistrations({ showRefresh: true })
                }
                disabled={loading || refreshing}
              >
                {refreshing ? (
                  <Loader2
                    size={16}
                    className="coordinator-spin"
                  />
                ) : (
                  <RefreshCw size={16} />
                )}
                Refresh
              </button>

              <button
                type="button"
                className="coordinator-btn coordinator-btn-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </section>

          {error && (
            <section className="coordinator-error">
              <AlertCircle size={21} />

              <div>
                <p className="coordinator-error-title">
                  Dashboard could not load
                </p>

                <p className="coordinator-error-message">
                  {error}
                </p>

                <button
                  type="button"
                  className="coordinator-btn coordinator-btn-danger coordinator-error-btn"
                  onClick={() => fetchRegistrations()}
                >
                  Try Again
                </button>
              </div>
            </section>
          )}

        

          <section className="coordinator-stats">
            <CoordinatorStatCard
              label="Registrations"
              value={loading ? null : stats.totalRegistrations}
              icon={<Clipboard size={23} />}
              tone="red"
            />

            <CoordinatorStatCard
              label="Total Students"
              value={loading ? null : stats.totalParticipants}
              icon={<Users size={23} />}
              tone="blue"
            />

            <CoordinatorStatCard
              label="Paid Students"
              value={loading ? null : stats.paidParticipants}
              icon={<BadgeCheck size={23} />}
              tone="green"
            />

            <CoordinatorStatCard
              label="Pending Payments"
              value={loading ? null : stats.pendingParticipants}
              icon={<Clock size={23} />}
              tone="amber"
            />

            <CoordinatorStatCard
              label="Verified Collection"
              value={
                loading
                  ? null
                  : formatCurrency(stats.totalCollection)
              }
              icon={<IndianRupee size={23} />}
              tone="gold"
            />
          </section>

          <section className="coordinator-filter-panel">
            <div className="coordinator-filter-heading">
              <Filter size={17} />
              <span>Registration Filters</span>
            </div>

            <div className="coordinator-search-wrap">
              <Search
                size={18}
                className="coordinator-search-icon"
              />

              <input
                type="text"
                className="coordinator-search-input"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by name, registration number, team, email, phone, college..."
              />
            </div>

            <div className="coordinator-filter-grid">
              <div className="coordinator-select-wrap">
                <label>
                  <IndianRupee size={14} />
                  Payment
                </label>

                <select
                  value={paymentFilter}
                  onChange={(event) =>
                    setPaymentFilter(event.target.value)
                  }
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid / Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="coordinator-select-wrap">
                <label>
                  <UsersRound size={14} />
                  Registration Type
                </label>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value)
                  }
                >
                  <option value="all">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>

              
            </div>
          </section>

          <div className="coordinator-result-bar">
            <span>
              {loading
                ? "Loading registrations..."
                : `${filteredRegistrations.length} registration${
                    filteredRegistrations.length === 1 ? "" : "s"
                  } found`}
            </span>

            {filtersActive && (
              <button
                type="button"
                className="coordinator-clear-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          <section className="coordinator-table-wrap">
            <div className="coordinator-table-header">
              <span>Team Lead / Student</span>
              <span>Registration No.</span>
              <span>Event(s)</span>
              <span>Type</span>
              <span>Students</span>
              <span>Payment</span>
              <span>Amount</span>
              <span>Action</span>
            </div>

            {loading ? (
              <CoordinatorSkeletonRows />
            ) : filteredRegistrations.length === 0 ? (
              <CoordinatorEmptyState searchActive={filtersActive} />
            ) : (
              filteredRegistrations.map((row) => {
                const leader =
  getEventLeader(
    row,
    coordinatorEvent
  );

const events = [
  getEventLabel(coordinatorEvent),
];

const participantCount =
  getEventParticipants(
    row,
    coordinatorEvent
  ).length;

                return (
                  <div
                    className="coordinator-table-row"
                    key={row.id}
                  >
                    <span className="coordinator-name-cell">
                      <strong>
                        {leader.full_name ||
                          row.full_name ||
                          "—"}
                      </strong>

                      {participantCount > 1 && (
  <small>Team Lead</small>
)}
                    </span>

                    <span className="coordinator-mono">
                      {row.registration_number || "—"}
                    </span>

                    <span className="coordinator-event-cell">
                      {events.length
                        ? events.slice(0, 2).join(", ")
                        : "—"}

                      {events.length > 2 && (
                        <small>
                          +{events.length - 2} more
                        </small>
                      )}
                    </span>

                    <span>
  <RegistrationTypeBadge
    type={
      participantCount > 1
        ? "team"
        : "individual"
    }
  />
</span>

                    <span>{participantCount}</span>

                    <span>
                      <PaymentBadge row={row} />
                    </span>

                    <span className="coordinator-amount">
                      {formatCurrency(row.total_amount)}
                    </span>

                    <span>
                      <button
                        type="button"
                        className="coordinator-view-btn"
                        onClick={() =>
                          setSelectedRegistration(row)
                        }
                      >
                        View
                      </button>
                    </span>
                  </div>
                );
              })
            )}
          </section>

          <section className="coordinator-mobile-list">
            {loading ? (
              <CoordinatorMobileSkeleton />
            ) : filteredRegistrations.length === 0 ? (
              <CoordinatorEmptyState searchActive={filtersActive} />
            ) : (
              filteredRegistrations.map((row) => {
                const leader =
  getEventLeader(
    row,
    coordinatorEvent
  );

                return (
                  <button
                    type="button"
                    className="coordinator-mobile-card"
                    key={row.id}
                    onClick={() =>
                      setSelectedRegistration(row)
                    }
                  >
                    <div className="coordinator-mobile-top">
                      <div>
                        <strong>
                          {leader.full_name ||
                            row.full_name ||
                            "—"}
                        </strong>

                        <small>
                          {row.registration_number || "—"}
                        </small>
                      </div>

                      <PaymentBadge row={row} />
                    </div>

                    <div className="coordinator-mobile-info">
                      <span>
                        <b>Type</b>
                        {row.registration_type || "—"}
                      </span>

                      <span>
                        <b>Students</b>{
  getEventParticipants(
    row,
    coordinatorEvent
  ).length
}
                        {}
                      </span>

                      <span>
                        <b>Amount</b>
                        {formatCurrency(row.total_amount)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </section>
        </div>
      </main>

      {selectedRegistration && (
        <CoordinatorRegistrationModal
          row={selectedRegistration}
          coordinatorEvent={coordinatorEvent}
          onClose={() => setSelectedRegistration(null)}
          onCopyPhone={handleCopyPhone}
          copiedPhone={copiedPhone}
        />
      )}

      <style>{coordinatorStyles}</style>
    </>
  );
}

/* =========================================================
   STYLES
========================================================= */

const coordinatorStyles = `
  .coordinator-page {
    min-height: 100vh;
    background: #fdf9fa;
    color: #181414;
    padding: 2rem 0 5rem;
    box-sizing: border-box;
  }

  .coordinator-shell {
    width: min(1440px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .coordinator-hero {
    background: #fff;
    border: 1px solid rgba(220,0,0,.14);
    border-radius: 22px;
    padding: 1.8rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 10px 30px rgba(0,0,0,.045);
  }

  .coordinator-eyebrow {
    margin: 0 0 .35rem;
    font-family: 'Orbitron', sans-serif;
    font-size: .68rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #dc0000;
  }

  .coordinator-title {
    margin: 0 0 .8rem;
    font-family: 'Bangers', cursive;
    font-size: clamp(2rem,4vw,3rem);
    letter-spacing: .035em;
    color: #161313;
  }

  .coordinator-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: .5rem;
  }

  .coordinator-badge {
    display: inline-flex;
    align-items: center;
    padding: .42rem .85rem;
    border-radius: 999px;
    font-family: 'Orbitron', sans-serif;
    font-size: .63rem;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .coordinator-badge-role {
    color: #b91c1c;
    background: rgba(220,0,0,.07);
    border: 1px solid rgba(220,0,0,.18);
  }

  .coordinator-badge-event {
    color: #6b4d00;
    background: rgba(245,197,66,.16);
    border: 1px solid rgba(245,197,66,.4);
  }
    .coordinator-badge-welcome {
  color: #15803d;
  background: rgba(22,163,74,.08);
  border: 1px solid rgba(22,163,74,.2);
}

  .coordinator-name {
    color: #777;
    font-size: .78rem;
    font-weight: 600;
  }

  .coordinator-hero-actions {
    display: flex;
    gap: .65rem;
    flex-shrink: 0;
  }

  .coordinator-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .45rem;
    border-radius: 12px;
    padding: .7rem 1rem;
    border: 1px solid transparent;
    font-family: 'Orbitron', sans-serif;
    font-size: .67rem;
    letter-spacing: .04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: .18s ease;
  }

  .coordinator-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .coordinator-btn-secondary {
    background: #fff;
    color: #222;
    border-color: rgba(0,0,0,.12);
  }

  .coordinator-btn-secondary:hover:not(:disabled) {
    background: #f7f2f2;
  }

  .coordinator-btn-danger {
    color: #b91c1c;
    background: rgba(220,0,0,.06);
    border-color: rgba(220,0,0,.25);
  }

  .coordinator-btn-danger:hover:not(:disabled) {
    background: rgba(220,0,0,.11);
  }

  .coordinator-spin {
    animation: coordinator-spin .8s linear infinite;
  }

  @keyframes coordinator-spin {
    to { transform: rotate(360deg); }
  }

  .coordinator-error {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: 1.2rem 1.3rem;
    margin-bottom: 1.25rem;
    border-radius: 17px;
    color: #7f1d1d;
    background: rgba(220,0,0,.055);
    border: 1px solid rgba(220,0,0,.25);
  }

  .coordinator-error-title {
    margin: 0 0 .3rem;
    font-weight: 800;
  }

  .coordinator-error-message {
    margin: 0;
    font-size: .85rem;
    line-height: 1.5;
  }

  .coordinator-error-btn {
    margin-top: .75rem;
  }

  .coordinator-assignment {
    display: flex;
    align-items: center;
    gap: .9rem;
    padding: .95rem 1.1rem;
    margin-bottom: 1.25rem;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(220,0,0,.1);
    box-shadow: 0 7px 20px rgba(0,0,0,.035);
  }

  .coordinator-assignment-icon {
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc0000;
    background: rgba(220,0,0,.08);
  }

  .coordinator-assignment p {
    margin: 0 0 .15rem;
    color: #999;
    font-size: .66rem;
    text-transform: uppercase;
    letter-spacing: .07em;
    font-weight: 700;
  }

  .coordinator-assignment strong {
    font-size: .9rem;
  }

  .coordinator-assignment > span {
    margin-left: auto;
    padding: .35rem .65rem;
    border-radius: 999px;
    color: #777;
    background: #f5f3f3;
    font-size: .63rem;
    font-weight: 700;
  }

  .coordinator-stats {
    display: grid;
    grid-template-columns: repeat(5,1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .coordinator-stat-card {
    background: #fff;
    border: 1px solid rgba(220,0,0,.1);
    border-radius: 18px;
    padding: 1.25rem;
    min-height: 105px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-shadow: 0 8px 22px rgba(0,0,0,.035);
  }

  .coordinator-stat-label {
    margin: 0 0 .45rem;
    color: #777;
    font-size: .74rem;
  }

  .coordinator-stat-value {
    margin: 0;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.65rem;
    font-weight: 800;
    color: #171313;
  }

  .coordinator-stat-icon {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .coordinator-tone-red .coordinator-stat-icon {
    color: #dc0000;
    background: rgba(220,0,0,.08);
  }

  .coordinator-tone-blue .coordinator-stat-icon {
    color: #2563eb;
    background: rgba(37,99,235,.08);
  }

  .coordinator-tone-green .coordinator-stat-icon {
    color: #16a34a;
    background: rgba(22,163,74,.09);
  }

  .coordinator-tone-amber .coordinator-stat-icon {
    color: #d97706;
    background: rgba(217,119,6,.1);
  }

  .coordinator-tone-gold .coordinator-stat-icon {
    color: #8a6400;
    background: rgba(245,197,66,.18);
  }

  .coordinator-stat-skeleton {
    display: inline-block;
    width: 45px;
    height: 25px;
    border-radius: 6px;
    background: linear-gradient(90deg,#eee 25%,#f8f8f8 50%,#eee 75%);
    background-size: 200% 100%;
    animation: coordinator-shimmer 1.2s infinite;
  }

  @keyframes coordinator-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .coordinator-filter-panel {
    background: #fff;
    border: 1px solid rgba(220,0,0,.1);
    border-radius: 18px;
    padding: 1.1rem;
    margin-bottom: .8rem;
    box-shadow: 0 7px 20px rgba(0,0,0,.035);
  }

  .coordinator-filter-heading {
    display: flex;
    align-items: center;
    gap: .45rem;
    margin-bottom: .8rem;
    font-family: 'Orbitron', sans-serif;
    font-size: .68rem;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #b91c1c;
  }

  .coordinator-search-wrap {
    position: relative;
    margin-bottom: .85rem;
  }

  .coordinator-search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }

  .coordinator-search-input {
    width: 100%;
    box-sizing: border-box;
    padding: .9rem 1rem .9rem 2.65rem;
    border-radius: 13px;
    border: 1px solid rgba(0,0,0,.12);
    background: #fff;
    color: #222;
    font-size: .88rem;
  }

  .coordinator-search-input:focus {
    outline: none;
    border-color: rgba(220,0,0,.4);
  }

  .coordinator-filter-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: .8rem;
  }

  .coordinator-select-wrap label,
  .coordinator-locked-event label {
    display: flex;
    align-items: center;
    gap: .35rem;
    margin-bottom: .4rem;
    font-size: .7rem;
    color: #777;
  }

  .coordinator-select-wrap select {
    width: 100%;
    box-sizing: border-box;
    border-radius: 11px;
    border: 1px solid rgba(0,0,0,.12);
    background: #fff;
    padding: .72rem .8rem;
    color: #222;
    font-size: .82rem;
  }

  .coordinator-select-wrap select:focus {
    outline: none;
    border-color: rgba(220,0,0,.4);
  }

  .coordinator-locked-event > div {
    min-height: 42px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    border-radius: 11px;
    border: 1px solid rgba(220,0,0,.12);
    background: #fbf5f5;
    padding: .72rem .8rem;
    color: #333;
    font-size: .82rem;
    font-weight: 700;
  }

  .coordinator-locked-event > div span {
    color: #999;
    font-size: .62rem;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .coordinator-result-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 38px;
    color: #777;
    font-size: .78rem;
  }

  .coordinator-clear-btn {
    background: none;
    border: none;
    color: #b91c1c;
    font-size: .76rem;
    cursor: pointer;
    font-weight: 700;
  }

  .coordinator-table-wrap {
    background: #fff;
    border: 1px solid rgba(220,0,0,.1);
    border-radius: 18px;
    overflow-x: auto;
    box-shadow: 0 8px 22px rgba(0,0,0,.035);
  }

  .coordinator-table-header,
  .coordinator-table-row {
    min-width: 1100px;
    display: grid;
    grid-template-columns: 1.45fr 1.15fr 1.4fr .8fr .65fr .85fr .8fr .6fr;
    gap: .8rem;
    align-items: center;
    padding: .95rem 1.1rem;
  }

  .coordinator-table-header {
    background: #fbf2f2;
    color: #866d6d;
    font-family: 'Orbitron', sans-serif;
    font-size: .61rem;
    letter-spacing: .07em;
    text-transform: uppercase;
  }

  .coordinator-table-row {
    border-top: 1px solid rgba(0,0,0,.055);
    font-size: .8rem;
  }

  .coordinator-name-cell {
    display: flex;
    flex-direction: column;
    gap: .22rem;
    min-width: 0;
  }

  .coordinator-name-cell strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .coordinator-name-cell small,
  .coordinator-event-cell small {
    color: #b91c1c;
    font-size: .62rem;
  }

  .coordinator-mono {
    font-family: monospace;
    font-size: .78rem;
  }

  .coordinator-event-cell {
    display: flex;
    flex-direction: column;
    gap: .2rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .coordinator-type-badge,
  .coordinator-payment-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: .3rem .62rem;
    border-radius: 999px;
    font-family: 'Orbitron', sans-serif;
    font-size: .58rem;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .coordinator-type-team {
    color: #6b4d00;
    background: rgba(245,197,66,.16);
  }

  .coordinator-type-individual {
    color: #2563eb;
    background: rgba(37,99,235,.08);
  }

  .coordinator-payment-paid {
    color: #15803d;
    background: rgba(22,163,74,.1);
  }

  .coordinator-payment-pending {
    color: #b45309;
    background: rgba(217,119,6,.11);
  }

  .coordinator-amount {
    font-family: 'Orbitron', sans-serif;
    font-size: .72rem;
    font-weight: 700;
  }

  .coordinator-view-btn {
    border: none;
    background: none;
    color: #b91c1c;
    font-size: .8rem;
    font-weight: 800;
    cursor: pointer;
  }

  .coordinator-view-btn:hover {
    text-decoration: underline;
  }

  .coordinator-skeleton-line {
    height: 12px;
    width: 75%;
    border-radius: 5px;
    background: linear-gradient(90deg,#eee 25%,#f8f8f8 50%,#eee 75%);
    background-size: 200% 100%;
    animation: coordinator-shimmer 1.2s infinite;
  }

  .coordinator-empty {
    padding: 4rem 1rem;
    text-align: center;
    color: #aaa;
    grid-column: 1 / -1;
  }

  .coordinator-empty h3 {
    color: #333;
    margin: .75rem 0 .35rem;
  }

  .coordinator-empty p {
    margin: 0;
    font-size: .82rem;
  }

  .coordinator-mobile-list {
    display: none;
  }

  .coordinator-mobile-card {
    display: block;
    width: 100%;
    text-align: left;
    background: #fff;
    border: 1px solid rgba(220,0,0,.1);
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: .75rem;
    cursor: pointer;
  }

  .coordinator-mobile-top {
    display: flex;
    justify-content: space-between;
    gap: .8rem;
    margin-bottom: .8rem;
  }

  .coordinator-mobile-top > div {
    display: flex;
    flex-direction: column;
    gap: .25rem;
  }

  .coordinator-mobile-top small {
    color: #999;
    font-family: monospace;
  }

  .coordinator-mobile-info {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: .5rem;
  }

  .coordinator-mobile-info span {
    display: flex;
    flex-direction: column;
    gap: .2rem;
    color: #555;
    font-size: .76rem;
  }

  .coordinator-mobile-info b {
    color: #aaa;
    font-size: .62rem;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .coordinator-mobile-skeleton {
    display: flex;
    flex-direction: column;
    gap: .55rem;
  }

  .coordinator-mobile-skeleton span {
    display: block;
    height: 12px;
    border-radius: 5px;
    background: #eee;
  }

  .coordinator-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0,0,0,.48);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 1.5rem 1rem;
    overflow-y: auto;
  }

  .coordinator-modal {
    width: 100%;
    max-width: 760px;
    background: #fff;
    border-radius: 21px;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,.28);
  }

  .coordinator-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 1.25rem 1.4rem;
    border-bottom: 1px solid rgba(0,0,0,.08);
  }

  .coordinator-modal-eyebrow {
    margin: 0 0 .25rem;
    color: #dc0000;
    font-family: 'Orbitron', sans-serif;
    font-size: .58rem;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .coordinator-modal-header h2 {
    margin: 0;
    font-family: 'Bangers', cursive;
    font-size: 1.6rem;
    letter-spacing: .04em;
    color: #171313;
  }

  .coordinator-modal-badges {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .45rem;
    margin-top: .55rem;
  }

  .coordinator-modal-event {
    display: inline-flex;
    align-items: center;
    padding: .3rem .6rem;
    border-radius: 999px;
    color: #6b4d00;
    background: rgba(245,197,66,.16);
    font-size: .62rem;
    font-weight: 700;
  }

  .coordinator-modal-close {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: #f5f1f1;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .coordinator-modal-body {
    padding: 1.25rem 1.4rem 2rem;
  }

  .coordinator-modal-section {
    margin-bottom: 1.55rem;
  }

  .coordinator-section-title {
    margin: 0 0 .7rem;
    color: #b91c1c;
    font-family: 'Orbitron', sans-serif;
    font-size: .64rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .coordinator-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: .58rem 0;
    border-top: 1px solid rgba(0,0,0,.05);
    font-size: .83rem;
  }

  .coordinator-detail-label {
    color: #999;
    flex-shrink: 0;
  }

  .coordinator-detail-value {
    text-align: right;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: .35rem;
    word-break: break-word;
    color: #171313;
  }

  .coordinator-copy-btn {
    width: 23px;
    height: 23px;
    flex-shrink: 0;
    border: none;
    border-radius: 6px;
    background: rgba(0,0,0,.055);
    color: #666;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .coordinator-section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .coordinator-member-count {
    color: #888;
    font-size: .72rem;
  }

  .coordinator-member-list {
    display: grid;
    gap: .75rem;
  }

  .coordinator-member-card {
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 14px;
    padding: 1rem;
    background: #fff;
  }

  .coordinator-member-top {
    display: flex;
    align-items: center;
    gap: .75rem;
    margin-bottom: .8rem;
  }

  .coordinator-member-number {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b91c1c;
    background: rgba(220,0,0,.08);
    font-family: 'Orbitron', sans-serif;
    font-size: .7rem;
  }

  .coordinator-member-top div {
    display: flex;
    flex-direction: column;
    gap: .2rem;
  }

  .coordinator-member-top strong {
    color: #171313;
  }

  .coordinator-member-top small {
    color: #777;
    font-size: .72rem;
  }

  .coordinator-member-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .7rem;
  }

  .coordinator-member-detail {
    display: flex;
    flex-direction: column;
    gap: .25rem;
  }

  .coordinator-member-detail small {
    color: #aaa;
    font-size: .63rem;
    text-transform: uppercase;
  }

  .coordinator-member-detail > div {
    display: flex;
    align-items: center;
    gap: .3rem;
    font-size: .78rem;
    word-break: break-word;
    color: #171313;
  }

  .coordinator-no-members {
    border: 1px dashed rgba(0,0,0,.14);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    color: #999;
    font-size: .8rem;
  }

  .coordinator-event-list {
    display: grid;
    gap: .55rem;
  }

  .coordinator-event-item {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: .75rem .85rem;
    border-radius: 11px;
    background: #faf6f6;
    border: 1px solid rgba(220,0,0,.07);
  }

  .coordinator-event-current {
    background: rgba(220,0,0,.045);
    border-color: rgba(220,0,0,.18);
  }

  .coordinator-event-item > div:first-child {
    display: flex;
    flex-direction: column;
    gap: .2rem;
  }

  .coordinator-event-item strong {
    color: #171313;
    font-size: .8rem;
  }

  .coordinator-event-item small {
    color: #999;
    font-family: monospace;
    font-size: .65rem;
  }

  .coordinator-event-right {
    display: flex;
    align-items: center;
    gap: .55rem;
    flex-shrink: 0;
  }

  .coordinator-event-right > span {
    color: #888;
    font-size: .7rem;
  }

  .coordinator-current-event {
    color: #b91c1c !important;
    background: rgba(220,0,0,.08);
    padding: .28rem .5rem;
    border-radius: 999px;
    font-size: .6rem !important;
    font-weight: 800;
    text-transform: uppercase;
  }

  .coordinator-screenshot-btn {
    display: inline-flex;
    align-items: center;
    gap: .45rem;
    margin-top: 1rem;
    padding: .72rem .95rem;
    border-radius: 11px;
    color: #fff;
    background: #dc0000;
    text-decoration: none;
    font-size: .72rem;
    font-weight: 800;
  }

  .coordinator-screenshot-btn:hover {
    background: #f01818;
  }

  .coordinator-no-screenshot {
    margin-top: 1rem;
    border: 1px dashed rgba(0,0,0,.14);
    border-radius: 12px;
    padding: .85rem;
    color: #999;
    font-size: .78rem;
  }

  .coordinator-payment-notes {
    margin-top: 1rem;
    padding: .9rem 1rem;
    border-radius: 12px;
    background: rgba(245,197,66,.1);
    border: 1px solid rgba(245,197,66,.25);
  }

  .coordinator-payment-notes p {
    margin: 0 0 .35rem;
    color: #8a6400;
    font-size: .63rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  .coordinator-payment-notes span {
    color: #555;
    font-size: .78rem;
    line-height: 1.5;
  }

  .coordinator-muted {
    color: #999;
    font-size: .8rem;
  }

  @media (max-width: 1200px) {
    .coordinator-stats {
      grid-template-columns: repeat(3,1fr);
    }
  }

  @media (max-width: 900px) {
    .coordinator-hero {
      align-items: flex-start;
      flex-direction: column;
    }

    .coordinator-hero-actions {
      width: 100%;
    }

    .coordinator-hero-actions .coordinator-btn {
      flex: 1;
    }

    .coordinator-stats {
      grid-template-columns: repeat(2,1fr);
    }

    .coordinator-table-wrap {
      display: none;
    }

    .coordinator-mobile-list {
      display: block;
    }
  }

  @media (max-width: 650px) {
    .coordinator-page {
      padding-top: 1.2rem;
    }

    .coordinator-shell {
      width: min(100% - 1rem,1440px);
    }

    .coordinator-hero {
      padding: 1.3rem;
    }

    .coordinator-title {
      font-size: 2rem;
    }

    .coordinator-stats {
      grid-template-columns: 1fr;
    }

    .coordinator-filter-grid {
      grid-template-columns: 1fr;
    }

    .coordinator-member-details {
      grid-template-columns: 1fr;
    }

    .coordinator-mobile-info {
      grid-template-columns: repeat(3,1fr);
    }

    .coordinator-modal-overlay {
      padding: .5rem;
    }

    .coordinator-modal-body {
      padding: 1rem;
    }

    .coordinator-detail-row {
      flex-direction: column;
      gap: .2rem;
    }

    .coordinator-detail-value {
      text-align: left;
      justify-content: flex-start;
    }

    .coordinator-assignment > span {
      display: none;
    }

    .coordinator-event-item {
      align-items: flex-start;
    }

    .coordinator-event-right {
      flex-direction: column;
      align-items: flex-end;
    }
  }
`;
