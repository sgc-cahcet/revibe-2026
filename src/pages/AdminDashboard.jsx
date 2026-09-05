import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

/* =========================================================
   REVIBE '26 EVENTS
========================================================= */

const EVENTS = [
  {
    slug: "paper-presentation",
    label: "Paper Presentation",
  },
  {
    slug: "mini-hackathon",
    label: "Mini Hackathon",
  },
  {
    slug: "technical-quiz",
    label: "Technical Quiz",
  },
  {
    slug: "coding-debugging",
    label: "Coding & Debugging",
  },
  {
    slug: "shark-tank",
    label: "Shark Tank × SGC",
  },
  {
    slug: "prompt-wars",
    label: "Prompt Wars",
  },
  {
    slug: "connection",
    label: "Connections",
  },
  {
    slug: "chess",
    label: "Chess",
  },
  {
    slug: "free-fire",
    label: "Free Fire",
  },
  {
    slug: "mehandi",
    label: "Mehandi",
  },
  {
    slug: "cooking-without-fire",
    label: "Cooking Without Fire",
  },
  {
    slug: "art-painting",
    label: "Art & Painting",
  },
  {
    slug: "ipl-auction",
    label: "IPL Auction",
  },
];

const EVENT_LABELS = EVENTS.reduce((acc, event) => {
  acc[event.slug] = event.label;
  return acc;
}, {});

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[×*]/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isPaid(row) {
  const status = normalize(row?.payment_status);

  return (
    status === "paid" ||
    status === "verified" ||
    status === "success" ||
    status === "successful"
  );
}

function normalizeParticipant(participant) {
  if (!participant) return null;

  if (typeof participant === "string") {
    return {
      name: participant,
      email: "",
      phone: "",
      college_name: "",
      department: "",
      year: "",
      role: "",
    };
  }

  return {
    name:
      participant.name ||
      participant.full_name ||
      participant.student_name ||
      participant.member_name ||
      participant.participant_name ||
      "Unnamed Participant",

    email:
      participant.email ||
      participant.student_email ||
      participant.member_email ||
      "",

    phone:
      participant.phone ||
      participant.mobile ||
      participant.phone_number ||
      "",

    college_name:
      participant.college_name ||
      participant.college ||
      "",

    department:
      participant.department ||
      participant.dept ||
      "",

    year:
      participant.year ||
      participant.study_year ||
      participant.current_year ||
      "",

    role:
      participant.role ||
      participant.member_role ||
      "",
  };
}

function getAllParticipants(row) {
  const participants = [];

  const selectedEvents = safeArray(row?.selected_events);

  selectedEvents.forEach((event) => {
    const eventParticipants =
      event?.participants ||
      event?.members ||
      event?.participant_details ||
      event?.event_participants ||
      event?.team_members ||
      [];

    safeArray(eventParticipants).forEach((participant) => {
      const normalized = normalizeParticipant(participant);

      if (normalized) {
        participants.push(normalized);
      }
    });
  });

  if (participants.length > 0) {
    const seen = new Set();

    return participants.filter((participant) => {
      const key = [
        normalize(participant.name),
        normalize(participant.email),
        normalize(participant.phone),
      ].join("|");

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  const fallback = [];

  const leader = normalizeParticipant({
    name: row?.full_name,
    email: row?.email,
    phone: row?.phone,
    college_name: row?.college_name,
    department: row?.department,
    year: row?.year,
    role: "Leader",
  });

  if (leader?.name && leader.name !== "Unnamed Participant") {
    fallback.push(leader);
  }

  safeArray(row?.team_members).forEach((participant) => {
    const normalized = normalizeParticipant(participant);

    if (normalized) {
      fallback.push(normalized);
    }
  });

  const seen = new Set();

  return fallback.filter((participant) => {
    const key = [
      normalize(participant.name),
      normalize(participant.email),
      normalize(participant.phone),
    ].join("|");

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function getLeader(row, participants = null) {
  const list = participants || getAllParticipants(row);

  const leader = list.find((participant) => {
    return normalize(participant.role).includes("leader");
  });

  return (
    leader || {
      name: row?.full_name || "Unknown Student",
      email: row?.email || "",
      phone: row?.phone || "",
      college_name: row?.college_name || "",
      department: row?.department || "",
      year: row?.year || "",
      role: "Leader",
    }
  );
}

function normalizeSelectedEvent(event) {
  if (!event) return {};

  if (typeof event === "string") {
    return {
      slug: normalize(event),
      event_name: event,
      participants: [],
    };
  }

  return {
    ...event,
    slug:
      event.slug ||
      event.event_slug ||
      event.eventSlug ||
      "",
    event_name:
      event.event_name ||
      event.name ||
      event.title ||
      event.event ||
      "",
    participants:
      event.participants ||
      event.members ||
      event.participant_details ||
      event.event_participants ||
      event.team_members ||
      [],
  };
}

function getEventEntry(row, eventSlug) {
  const targetSlug = normalize(eventSlug);
  const targetLabel = normalize(EVENT_LABELS[eventSlug] || eventSlug);

  return safeArray(row?.selected_events).find((event) => {
    const normalizedEvent = normalizeSelectedEvent(event);

    const eventSlugValue = normalize(normalizedEvent.slug);
    const eventNameValue = normalize(normalizedEvent.event_name);

    return (
      eventSlugValue === targetSlug ||
      eventNameValue === targetLabel ||
      eventNameValue === targetSlug
    );
  });
}

function getEventParticipants(row, eventSlug) {
  const eventEntry = getEventEntry(row, eventSlug);

  if (!eventEntry) return [];

  const normalizedEvent = normalizeSelectedEvent(eventEntry);

  return safeArray(normalizedEvent.participants)
    .map(normalizeParticipant)
    .filter(Boolean);
}

function getEventNames(row) {
  return safeArray(row?.selected_events)
    .map((event) => {
      const normalizedEvent = normalizeSelectedEvent(event);

      return (
        normalizedEvent.event_name ||
        normalizedEvent.slug ||
        ""
      );
    })
    .filter(Boolean);
}

function getParticipantCountForEvent(row, eventSlug) {
  const participants = getEventParticipants(row, eventSlug);

  if (participants.length > 0) {
    return participants.length;
  }

  const eventEntry = getEventEntry(row, eventSlug);

  if (eventEntry?.participant_count) {
    return Number(eventEntry.participant_count) || 0;
  }

  if (eventEntry?.team_size) {
    return Number(eventEntry.team_size) || 0;
  }

  return 1;
}

function getEventRows(rows, eventSlug) {
  return rows.filter((row) => Boolean(getEventEntry(row, eventSlug)));
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatusBadge({ paid }) {
  return (
    <span className={`status-badge ${paid ? "paid" : "pending"}`}>
      <span className="status-dot" />
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

function StatCard({ label, value, icon, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>

        {subtext ? (
          <div className="stat-subtext">{subtext}</div>
        ) : null}
      </div>
    </div>
  );
}

function EventCard({ event, rows, onClick }) {
  const eventRows = getEventRows(rows, event.slug);

  const registrationCount = eventRows.length;

  const studentCount = eventRows.reduce((total, row) => {
    return total + getParticipantCountForEvent(row, event.slug);
  }, 0);

  const paidCount = eventRows.filter(isPaid).length;

  const pendingCount = registrationCount - paidCount;

  return (
    <button
      type="button"
      className="event-card"
      onClick={() => onClick(event.slug)}
    >
      <div className="event-card-top">
        <span className="event-number">
          {String(EVENTS.findIndex((item) => item.slug === event.slug) + 1).padStart(
            2,
            "0"
          )}
        </span>

        <span className="event-arrow">↗</span>
      </div>

      <div className="event-card-title">
        {event.label}
      </div>

      <div className="event-card-stats">
        <div>
          <strong>{registrationCount}</strong>
          <span>Registrations</span>
        </div>

        <div>
          <strong>{studentCount}</strong>
          <span>Students</span>
        </div>
      </div>

      <div className="event-card-footer">
        <span className="event-paid">
          {paidCount} paid
        </span>

        <span className="event-pending">
          {pendingCount} pending
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   REGISTRATION MODAL
========================================================= */

function RegistrationModal({
  row,
  eventSlug,
  onClose,
  onVerify,
  verifying,
  onDelete,
  deleting,
}) {
  if (!row) return null;

  const eventParticipants = eventSlug
    ? getEventParticipants(row, eventSlug)
    : [];

  const allParticipants = getAllParticipants(row);

  const participants =
    eventSlug && eventParticipants.length > 0
      ? eventParticipants
      : allParticipants;

  const leader = getLeader(
    row,
    participants.length > 0 ? participants : null
  );

  const selectedEvents = getEventNames(row);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">
              Registration Details
            </div>

            <h2>
              {row.registration_number || "Registration"}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {eventSlug ? (
            <div className="context-banner">
              <span>Viewing Event</span>
              <strong>{EVENT_LABELS[eventSlug]}</strong>
            </div>
          ) : null}

          {/* LEAD */}
          <section className="detail-section">
            <div className="section-title">
              Lead Student
            </div>

            <div className="lead-card">
              <div className="avatar">
                {String(leader.name || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>{leader.name}</h3>

                <p>
                  {leader.email || "No email"}
                </p>

                <p>
                  {leader.phone || "No phone"}
                </p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span>College</span>
                <strong>
                  {row.college_name || leader.college_name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Department</span>
                <strong>
                  {row.department || leader.department || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Year</span>
                <strong>
                  {row.year || leader.year || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Registration Type</span>
                <strong>
                  {row.registration_type || "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* PARTICIPANTS */}
          <section className="detail-section">
            <div className="section-heading-row">
              <div className="section-title">
                {eventSlug
                  ? `${EVENT_LABELS[eventSlug]} Participants`
                  : "Participants"}
              </div>

              <span className="count-pill">
                {participants.length}
              </span>
            </div>

            {participants.length > 0 ? (
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div
                    className="participant-row"
                    key={[
                      participant.email,
                      participant.phone,
                      participant.name,
                      index,
                    ].join("-")}
                  >
                    <div className="participant-index">
                      {index + 1}
                    </div>

                    <div className="participant-main">
                      <strong>
                        {participant.name}
                      </strong>

                      <span>
                        {participant.email || "No email"}
                      </span>
                    </div>

                    <div className="participant-meta">
                      {participant.role ? (
                        <span>
                          {participant.role}
                        </span>
                      ) : null}

                      {participant.year ? (
                        <span>
                          Year {participant.year}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-small">
                No participant details available.
              </div>
            )}
          </section>

          {/* EVENTS */}
          <section className="detail-section">
            <div className="section-title">
              Selected Events
            </div>

            <div className="selected-events">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((name, index) => (
                  <span
                    className="event-chip"
                    key={`${name}-${index}`}
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="muted">
                  No events found
                </span>
              )}
            </div>
          </section>

          {/* PAYMENT */}
          <section className="detail-section payment-section">
            <div className="section-heading-row">
              <div className="section-title">
                Payment Details
              </div>

              <StatusBadge paid={isPaid(row)} />
            </div>

            <div className="payment-summary">
              <div>
                <span>Total Amount</span>
                <strong>
                  {formatCurrency(row.total_amount)}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>
                  {row.payment_method || "—"}
                </strong>
              </div>

              <div>
                <span>Verified At</span>
                <strong>
                  {formatDate(row.verified_at)}
                </strong>
              </div>
            </div>

            {row.payment_screenshot_url ? (
              <div className="screenshot-block">
                <div className="screenshot-heading">
                  Payment Screenshot
                </div>

                <a
                  href={row.payment_screenshot_url}
                  target="_blank"
                  rel="noreferrer"
                  className="screenshot-link"
                >
                  <img
                    src={row.payment_screenshot_url}
                    alt="Payment screenshot"
                  />

                  <span>
                    Open full screenshot ↗
                  </span>
                </a>
              </div>
            ) : null}

            {!isPaid(row) ? (
              <button
                type="button"
                className="verify-button"
                disabled={verifying}
                onClick={() => onVerify(row)}
              >
                {verifying
                  ? "Verifying Payment..."
                  : "✓ Verify Payment"}
              </button>
            ) : (
              <div className="verified-message">
                PAYMENT VERIFIED
              </div>
            )}
          </section>

          <section className="detail-section delete-section">
            <div className="section-title">Danger Zone</div>
            <p className="delete-section-desc">
              Permanently delete this registration and all
              associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="delete-section-button"
              disabled={deleting}
              onClick={() => onDelete(row)}
            >
              {deleting
                ? "Deleting..."
                : "Delete Registration"}
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}

function VerificationConfirmModal({
  row,
  onCancel,
  onConfirm,
  verifying,
}) {
  if (!row) return null;

  return (
    <div
      className="verification-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !verifying) {
          onCancel();
        }
      }}
    >
      <div
        className="verification-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-modal-title"
      >
        <div className="verification-modal-eyebrow">
          PAYMENT REVIEW
        </div>

        <h2 id="verification-modal-title">
          VERIFY PAYMENT
        </h2>

        <p>
          Are you sure you want to verify payment for
        </p>

        <strong className="verification-registration-number">
          {row.registration_number || "this registration"}
        </strong>

        <div className="verification-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={verifying}
          >
            CANCEL
          </button>

          <button
            type="button"
            className="verify-button"
            onClick={onConfirm}
            disabled={verifying}
          >
            {verifying ? "Verifying Payment..." : "VERIFY PAYMENT"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  row,
  onCancel,
  onConfirm,
  deleting,
}) {
  if (!row) return null;

  return (
    <div
      className="delete-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onCancel();
        }
      }}
    >
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="delete-modal-eyebrow">
          DELETE REGISTRATION
        </div>

        <h2 id="delete-modal-title">
          DELETE THIS PARTICIPANT?
        </h2>

        <p>
          Are you sure you want to permanently delete the
          registration for
        </p>

        <strong className="delete-modal-participant">
          {row.full_name || "Unknown Participant"}
        </strong>

        <div className="delete-modal-reg-number">
          {row.registration_number || "—"}
        </div>

        <div className="delete-modal-warning">
          This will permanently remove the registration and
          all related data including registration members,
          events, and payment records. This action cannot be
          undone.
        </div>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={deleting}
          >
            CANCEL
          </button>

          <button
            type="button"
            className="delete-confirm-button"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "DELETE REGISTRATION"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function RegistrationTable({
  rows,
  eventSlug,
  onView,
  onDelete,
  deletingId,
}) {
  return (
    <>
      <div className="desktop-table">
        <table>
          <thead>
            <tr>
              <th>Lead / Student</th>
              <th>Registration</th>
              {!eventSlug ? <th>Events</th> : null}
              <th>Type</th>
              <th>Students</th>
              <th>Payment</th>
              <th>Amount</th>
              <th />
              <th />
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const participants = eventSlug
                ? getEventParticipants(row, eventSlug)
                : getAllParticipants(row);

              const studentCount =
                participants.length > 0
                  ? participants.length
                  : 1;

              return (
                <tr key={row.id}>
                  <td>
                    <div className="student-cell">
                      <div className="table-avatar">
                        {String(
                          row.full_name || "?"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {row.full_name ||
                            "Unknown Student"}
                        </strong>

                        <span>
                          {row.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="registration-number">
                      {row.registration_number ||
                        "—"}
                    </span>
                  </td>

                  {!eventSlug ? (
                    <td>
                      <div className="table-events">
                        {getEventNames(row)
                          .slice(0, 2)
                          .map((name, index) => (
                            <span
                              className="mini-chip"
                              key={`${name}-${index}`}
                            >
                              {name}
                            </span>
                          ))}

                        {getEventNames(row).length >
                        2 ? (
                          <span className="more-events">
                            +
                            {getEventNames(row).length -
                              2}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  ) : null}

                  <td>
                    <span className="type-badge">
                      {row.registration_type ||
                        "—"}
                    </span>
                  </td>

                  <td>
                    <span className="student-count">
                      {studentCount}
                    </span>
                  </td>

                  <td>
                    <StatusBadge paid={isPaid(row)} />
                  </td>

                  <td>
                    <strong>
                      {formatCurrency(
                        row.total_amount
                      )}
                    </strong>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="view-button"
                      onClick={() => onView(row)}
                    >
                      View
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="delete-button"
                      disabled={deletingId === row.id}
                      onClick={() => onDelete(row)}
                    >
                      {deletingId === row.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mobile-list">
        {rows.map((row) => {
          const participants = eventSlug
            ? getEventParticipants(row, eventSlug)
            : getAllParticipants(row);

          const studentCount =
            participants.length > 0
              ? participants.length
              : 1;

          return (
            <div
              className="mobile-registration-card"
              key={row.id}
              onClick={() => onView(row)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onView(row);
                }
              }}
            >
              <div className="mobile-card-top">
                <div className="student-cell">
                  <div className="table-avatar">
                    {String(
                      row.full_name || "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {row.full_name ||
                        "Unknown Student"}
                    </strong>

                    <span>
                      {row.registration_number ||
                        "—"}
                    </span>
                  </div>
                </div>

                <StatusBadge paid={isPaid(row)} />
              </div>

              <div className="mobile-card-info">
                <div>
                  <span>Type</span>
                  <strong>
                    {row.registration_type ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Students</span>
                  <strong>
                    {studentCount}
                  </strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>
                    {formatCurrency(
                      row.total_amount
                    )}
                  </strong>
                </div>
              </div>

              {eventSlug ? (
                <div className="mobile-event-name">
                  {EVENT_LABELS[eventSlug]}
                </div>
              ) : (
                <div className="mobile-event-name">
                  {getEventNames(row)
                    .slice(0, 3)
                    .join(" • ")}
                </div>
              )}

              <div className="mobile-card-actions">
                <button
                  type="button"
                  className="delete-button"
                  disabled={deletingId === row.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row);
                  }}
                >
                  {deletingId === row.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* =========================================================
   MAIN ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedEventSlug, setSelectedEventSlug] =
    useState(null);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] =
    useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedRow, setSelectedRow] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [verificationCandidate, setVerificationCandidate] =
    useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] =
    useState(null);

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchRegistrations = async ({
    showRefresh = false,
  } = {}) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
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

      if (error) {
        console.error(
          "[AdminDashboard] Failed to fetch registrations:",
          error
        );

        alert(
          "Failed to load registrations. Please try again."
        );

        return;
      }

      setRows(data || []);
    } catch (error) {
      console.error(
        "[AdminDashboard] Fetch failed:",
        error
      );

      alert(
        "Something went wrong while loading registrations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED"
        ) {
          fetchRegistrations({
            showRefresh: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     RESET FILTERS WHEN CHANGING VIEW
  ======================================================= */

  useEffect(() => {
    setSearch("");
    setPaymentFilter("all");
    setTypeFilter("all");
  }, [selectedEventSlug]);

  /* =======================================================
     OVERALL STATS
  ======================================================= */

  const overallStats = useMemo(() => {
    const registrations = rows.length;

    const totalStudents = rows.reduce(
      (total, row) => {
        const count = getAllParticipants(row).length;

        return total + (count > 0 ? count : 1);
      },
      0
    );

    const paidStudents = rows.reduce(
      (total, row) => {
        if (!isPaid(row)) return total;

        const count = getAllParticipants(row).length;

        return total + (count > 0 ? count : 1);
      },
      0
    );

    const pendingPayments = rows.filter(
      (row) => !isPaid(row)
    ).length;

    const verifiedCollection = rows.reduce(
      (total, row) => {
        return isPaid(row)
          ? total + Number(row.total_amount || 0)
          : total;
      },
      0
    );

    return {
      registrations,
      totalStudents,
      paidStudents,
      pendingPayments,
      verifiedCollection,
    };
  }, [rows]);

  /* =======================================================
     EVENT STATS
  ======================================================= */

  const selectedEventStats = useMemo(() => {
    if (!selectedEventSlug) {
      return null;
    }

    const baseRows = getEventRows(
      rows,
      selectedEventSlug
    );

    const registrations = baseRows.length;

    const students = baseRows.reduce(
      (total, row) => {
        return (
          total +
          getParticipantCountForEvent(
            row,
            selectedEventSlug
          )
        );
      },
      0
    );

    const paidRegistrations = baseRows.filter(
      isPaid
    ).length;

    const pendingRegistrations =
      registrations - paidRegistrations;

    const paidStudents = baseRows
      .filter(isPaid)
      .reduce((total, row) => {
        return (
          total +
          getParticipantCountForEvent(
            row,
            selectedEventSlug
          )
        );
      }, 0);

    return {
      registrations,
      students,
      paidRegistrations,
      pendingRegistrations,
      paidStudents,
    };
  }, [rows, selectedEventSlug]);

  /* =======================================================
     TYPES
  ======================================================= */

  const registrationTypes = useMemo(() => {
    return Array.from(
      new Set(
        rows
          .map((row) => row.registration_type)
          .filter(Boolean)
      )
    );
  }, [rows]);

  /* =======================================================
     VERIFY PAYMENT
  ======================================================= */

  const verifyPayment = async (row) => {
    if (!row?.id) return;

    try {
      setVerifyingId(row.id);

      const verificationTime =
        new Date().toISOString();

      const { data: updatedRow, error } =
        await supabase
          .from("overall")
          .update({
            payment_status: "paid",
            paid_at:
              row.paid_at || verificationTime,
            verified_at: verificationTime,
            registration_status: "confirmed",
            updated_at: verificationTime,
          })
          .eq("id", row.id)
          .select(`
            id,
            payment_status,
            paid_at,
            verified_at,
            registration_status,
            updated_at
          `)
          .maybeSingle();

      if (error) {
        console.error(
          "[AdminDashboard] Payment verification failed:",
          error
        );

        console.error(
          "Payment verification failed. Please try again."
        );

        return;
      }

      if (!updatedRow) {
        console.error(
          "Payment could not be verified. You may not have permission to update this registration."
        );

        return;
      }

      if (
        normalize(updatedRow.payment_status) !==
        "paid"
      ) {
        console.error(
          "The payment update was not confirmed by Supabase."
        );

        return;
      }

      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === row.id
            ? {
                ...currentRow,
                ...updatedRow,
              }
            : currentRow
        )
      );

      setSelectedRow((currentRow) =>
        currentRow?.id === row.id
          ? {
              ...currentRow,
              ...updatedRow,
            }
          : currentRow
      );

      setVerificationCandidate(null);
    } catch (error) {
      console.error(
        "[AdminDashboard] Verification error:",
        error
      );

      alert(
        "Something went wrong while verifying the payment."
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const requestVerification = (row) => {
    setVerificationCandidate(row);
  };

  /* =======================================================
     DELETE REGISTRATION
  ======================================================= */

  const requestDelete = (row) => {
    setDeleteCandidate(row);
  };

  const deleteParticipant = async (row) => {
    if (!row?.id) return;

    try {
      setDeletingId(row.id);

      let registrationId = null;
      let primaryParticipantId = null;

      const {
        data: registrationRow,
        error: regLookupError,
      } = await supabase
        .from("registrations")
        .select("id, primary_participant_id")
        .eq("registration_number", row.registration_number)
        .maybeSingle();

      if (regLookupError) {
        console.warn(
          "[AdminDashboard] Registration lookup failed (RLS or missing record):",
          regLookupError.code,
          regLookupError.message
        );
      }

      if (registrationRow) {
        registrationId = registrationRow.id;
        primaryParticipantId =
          registrationRow.primary_participant_id;
      }

      if (registrationId) {
        const { data: memberRows } = await supabase
          .from("registration_members")
          .select("participant_id")
          .eq("registration_id", registrationId);

        const memberParticipantIds = (memberRows || [])
          .map((m) => m.participant_id)
          .filter(Boolean);

        const allParticipantIds = [
          ...new Set([
            primaryParticipantId,
            ...memberParticipantIds,
          ].filter(Boolean)),
        ];

        await supabase
          .from("registration_members")
          .delete()
          .eq("registration_id", registrationId);

        await supabase
          .from("registration_events")
          .delete()
          .eq("registration_id", registrationId);

        await supabase
          .from("payments")
          .delete()
          .eq("registration_id", registrationId);

        await supabase
          .from("registrations")
          .delete()
          .eq("id", registrationId);

        for (const pid of allParticipantIds) {
          const { data: otherReg } = await supabase
            .from("registrations")
            .select("id")
            .eq("primary_participant_id", pid)
            .neq("id", registrationId)
            .limit(1);

          if (otherReg && otherReg.length > 0) continue;

          const { data: otherMember } = await supabase
            .from("registration_members")
            .select("id")
            .eq("participant_id", pid)
            .neq("registration_id", registrationId)
            .limit(1);

          if (otherMember && otherMember.length > 0)
            continue;

          await supabase
            .from("participants")
            .delete()
            .eq("id", pid);
        }
      } else {
        console.warn(
          "[AdminDashboard] Falling back to overall-only cleanup for",
          row.registration_number
        );

        await supabase
          .from("registrations")
          .delete()
          .eq("registration_number", row.registration_number);

        const { data: participantRow } = await supabase
          .from("participants")
          .select("id")
          .eq("email", row.email)
          .maybeSingle();

        if (participantRow) {
          await supabase
            .from("registration_members")
            .delete()
            .eq("participant_id", participantRow.id);

          await supabase
            .from("participants")
            .delete()
            .eq("id", participantRow.id);
        }
      }

      await supabase
        .from("overall")
        .delete()
        .eq("id", row.id);

      setRows((currentRows) =>
        currentRows.filter((r) => r.id !== row.id)
      );

      setSelectedRow((current) =>
        current?.id === row.id ? null : current
      );

      setDeleteCandidate(null);

      alert(
        "Registration " +
          (row.registration_number || "") +
          " has been deleted."
      );
    } catch (error) {
      console.error(
        "[AdminDashboard] Delete failed:",
        error
      );

      alert(
        error.message ||
          "Failed to delete registration. Please try again."
      );

      fetchRegistrations({ showRefresh: true });
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "[AdminDashboard] Logout failed:",
        error
      );

      alert("Logout failed. Please try again.");
    }
  };

  /* =======================================================
     EVENT VIEW
  ======================================================= */

  if (selectedEventSlug) {
    const event = EVENTS.find(
      (item) => item.slug === selectedEventSlug
    );
    const eventRows = getEventRows(rows, selectedEventSlug);

    return (
      <div className="admin-page">
        <style>{styles}</style>

        <div className="admin-container">
          <header className="admin-header">
            <div>
              <div className="admin-kicker">
                REVIBE ’26 · ADMIN
              </div>

              <h1>
                {event?.label || "Event Dashboard"}
              </h1>

              <p>
                Event-specific registrations,
                participants and payment verification.
              </p>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedEventSlug(null)
                }
              >
                ← All Events
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  fetchRegistrations({
                    showRefresh: true,
                  })
                }
                disabled={refreshing}
              >
                ↻{" "}
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </header>

          {selectedEventStats ? (
            <div className="stats-grid event-stats-grid">
              <StatCard
                label="Registrations"
                value={
                  selectedEventStats.registrations
                }
                icon="◎"
              />

              <StatCard
                label="Students"
                value={
                  selectedEventStats.students
                }
                icon="♙"
              />

              <StatCard
                label="Paid Registrations"
                value={
                  selectedEventStats.paidRegistrations
                }
                icon="✓"
              />

              <StatCard
                label="Pending Payments"
                value={
                  selectedEventStats.pendingRegistrations
                }
                icon="!"
              />

              <StatCard
                label="Paid Students"
                value={
                  selectedEventStats.paidStudents
                }
                icon="₹"
              />
            </div>
          ) : null}

          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <div className="section-kicker">
                  EVENT REGISTRATIONS
                </div>

                <h2>
                  {event?.label}
                </h2>
              </div>

              <div className="result-count">
                {eventRows.length} result
                {eventRows.length === 1
                  ? ""
                  : "s"}
              </div>
            </div>

            <div className="filters">
              <div className="search-box">
                <span>⌕</span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, email, registration..."
                />
              </div>

              <select
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Payments
                </option>
                <option value="paid">
                  Paid
                </option>
                <option value="pending">
                  Pending
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Types
                </option>

                {registrationTypes.map((type) => (
                  <option
                    value={type}
                    key={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loader" />
                <p>Loading registrations...</p>
              </div>
            ) : eventRows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ◌
                </div>

                <h3>
                  No registrations found
                </h3>

                <p>
                  There are no registrations matching
                  the current filters.
                </p>
              </div>
            ) : (
              <RegistrationTable
                rows={eventRows}
                eventSlug={selectedEventSlug}
                onView={setSelectedRow}
                onDelete={requestDelete}
                deletingId={deletingId}
              />
            )}
          </section>
        </div>

        <RegistrationModal
          row={selectedRow}
          eventSlug={selectedEventSlug}
          onClose={() => setSelectedRow(null)}
          onVerify={requestVerification}
          verifying={
            selectedRow?.id === verifyingId
          }
          onDelete={requestDelete}
          deleting={
            selectedRow?.id === deletingId
          }
        />

        <VerificationConfirmModal
          row={verificationCandidate}
          onCancel={() => setVerificationCandidate(null)}
          onConfirm={() => verifyPayment(verificationCandidate)}
          verifying={verificationCandidate?.id === verifyingId}
        />

        <DeleteConfirmModal
          row={deleteCandidate}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={() => deleteParticipant(deleteCandidate)}
          deleting={deleteCandidate?.id === deletingId}
        />
      </div>
    );
  }

  /* =======================================================
     MAIN OVERVIEW
  ======================================================= */

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="admin-container">
        <header className="admin-header">
          <div>
            <div className="admin-kicker">
              REVIBE ’26 · MASTER ADMIN
            </div>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage registrations, events and
              payment verification.
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                fetchRegistrations({
                  showRefresh: true,
                })
              }
              disabled={refreshing}
            >
              ↻{" "}
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* =================================================
            OVERALL STATS
        ================================================= */}

        <div className="stats-grid">
          <StatCard
            label="Registrations"
            value={overallStats.registrations}
            icon="◎"
            subtext="Total registrations"
          />

          <StatCard
            label="Total Students"
            value={overallStats.totalStudents}
            icon="♙"
            subtext="Across all events"
          />

          <StatCard
            label="Paid Students"
            value={overallStats.paidStudents}
            icon="✓"
            subtext="Verified registrations"
          />

          <StatCard
            label="Pending Payments"
            value={overallStats.pendingPayments}
            icon="!"
            subtext="Needs verification"
          />

          <StatCard
            label="Verified Collection"
            value={formatCurrency(
              overallStats.verifiedCollection
            )}
            icon="₹"
            subtext="Paid registrations"
          />
        </div>

        {/* =================================================
            EVENT OVERVIEW
        ================================================= */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <div className="section-kicker">
                EVENT OVERVIEW
              </div>

              <h2>
                REVIBE ’26 Events
              </h2>

              <p>
                Select an event to manage its
                registrations and verify payments.
              </p>
            </div>

            <div className="event-count">
              {EVENTS.length} Events
            </div>
          </div>

          <div className="event-grid">
            {EVENTS.map((event) => (
              <EventCard
                key={event.slug}
                event={event}
                rows={rows}
                onClick={setSelectedEventSlug}
              />
            ))}
          </div>
        </section>
      </div>

      <RegistrationModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onVerify={requestVerification}
        verifying={
          selectedRow?.id === verifyingId
        }
        onDelete={requestDelete}
        deleting={
          selectedRow?.id === deletingId
        }
      />

      <VerificationConfirmModal
        row={verificationCandidate}
        onCancel={() => setVerificationCandidate(null)}
        onConfirm={() => verifyPayment(verificationCandidate)}
        verifying={verificationCandidate?.id === verifyingId}
      />

      <DeleteConfirmModal
        row={deleteCandidate}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => deleteParticipant(deleteCandidate)}
        deleting={deleteCandidate?.id === deletingId}
      />
    </div>
  );
} 
const styles = `
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  button,
  input,
  select {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  /* =========================================================
     ADMIN PAGE
  ========================================================= */

  .admin-page {
    min-height: 100vh;
    padding: 34px 24px 80px;
    color: #15161b;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(239, 68, 68, 0.08),
        transparent 26%
      ),
      radial-gradient(
        circle at 100% 0%,
        rgba(0, 0, 0, 0.045),
        transparent 24%
      ),
      linear-gradient(
        180deg,
        #fafafa 0%,
        #f3f4f6 100%
      );
  }

  .admin-container {
    width: min(1520px, 100%);
    margin: 0 auto;
  }

  /* =========================================================
     HEADER
  ========================================================= */

  .admin-header {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 30px;
    padding: 4px 2px 0;
  }

  .admin-header::before {
    content: "";
    position: absolute;
    top: -34px;
    left: -24px;
    width: 130px;
    height: 4px;
    border-radius: 0 0 5px 0;
    background: #ef4444;
  }

  .admin-kicker,
  .section-kicker {
    color: #9296a1;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .admin-header h1 {
    margin: 8px 0 9px;
    color: #151720;
    font-size: clamp(34px, 4vw, 52px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.055em;
  }

  .admin-header p {
    margin: 0;
    color: #858a96;
    font-size: 13px;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  .secondary-button,
  .logout-button {
    min-height: 43px;
    padding: 0 16px;
    border: 1px solid #dedfe4;
    border-radius: 11px;
    background: #ffffff;
    color: #20232b;
    font-size: 11px;
    font-weight: 900;
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.035);
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }

  .secondary-button:hover,
  .logout-button:hover {
    transform: translateY(-2px);
    border-color: #cfd2d8;
    background: #ffffff;
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .secondary-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .logout-button {
    border-color: rgba(220, 38, 38, 0.2);
    color: #dc2626;
  }

  .logout-button:hover {
    border-color: rgba(220, 38, 38, 0.35);
    background: #fff7f7;
  }

  /* =========================================================
     STATISTICS
  ========================================================= */

  .stats-grid {
    display: grid;
    grid-template-columns:
      repeat(5, minmax(0, 1fr));
    gap: 13px;
    margin-bottom: 30px;
  }

  .event-stats-grid {
    grid-template-columns:
      repeat(5, minmax(0, 1fr));
  }

  .stat-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 120px;
    padding: 20px;
    overflow: hidden;
    border: 1px solid #e2e4e8;
    border-radius: 18px;
    background: #ffffff;
    box-shadow:
      0 8px 24px rgba(18, 22, 30, 0.045);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .stat-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: #ef4444;
    opacity: 0.8;
  }

  .stat-card::after {
    content: "";
    position: absolute;
    right: -45px;
    bottom: -55px;
    width: 125px;
    height: 125px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.045);
  }

  .stat-card:hover {
    transform: translateY(-3px);
    border-color: #d8dade;
    box-shadow:
      0 14px 34px rgba(18, 22, 30, 0.08);
  }

  .stat-icon {
    position: relative;
    z-index: 1;
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid #e6e7eb;
    border-radius: 14px;
    background:
      linear-gradient(
        145deg,
        #fafafa,
        #f0f1f3
      );
    color: #181a21;
    font-size: 19px;
    font-weight: 950;
  }

  .stat-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .stat-label {
    color: #777c88;
    font-size: 10px;
    font-weight: 850;
  }

  .stat-value {
    margin-top: 5px;
    color: #171922;
    font-size: 28px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.045em;
  }

  .stat-subtext {
    margin-top: 5px;
    color: #a0a4ae;
    font-size: 9px;
    font-weight: 600;
  }

  /* =========================================================
     MAIN SECTIONS
  ========================================================= */

  .dashboard-section {
    position: relative;
    margin-top: 28px;
    overflow: hidden;
    border: 1px solid #e0e2e7;
    border-radius: 22px;
    background: #ffffff;
    box-shadow:
      0 12px 38px rgba(18, 22, 30, 0.05);
  }

  .dashboard-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background:
      linear-gradient(
        90deg,
        #ef4444 0%,
        #ef4444 18%,
        #15161b 18%,
        #15161b 100%
      );
  }

  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    padding: 29px 28px 24px;
  }

  .section-header h2 {
    margin: 7px 0 6px;
    color: #171922;
    font-size: 26px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.045em;
  }

  .section-header p {
    margin: 0;
    color: #9297a2;
    font-size: 12px;
    font-weight: 500;
  }

  .event-count,
  .result-count {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 11px;
    border: 1px solid #e5e6ea;
    border-radius: 999px;
    background: #f8f8f9;
    color: #666b76;
    font-size: 10px;
    font-weight: 900;
    white-space: nowrap;
  }

  /* =========================================================
     EVENT CARDS
  ========================================================= */

  .event-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 15px;
    padding: 0 28px 28px;
  }

  .event-card {
  position: relative;
  min-height: 165px;
    padding: 19px;
    overflow: hidden;
    text-align: left;
    border: 1px solid #e4e5e9;
    border-radius: 18px;
    background:
      linear-gradient(
        145deg,
        #ffffff 0%,
        #ffffff 72%,
        #f8f8f9 100%
      );
    box-shadow:
      0 4px 14px rgba(18, 22, 30, 0.025);
    transition:
      transform 0.22s ease,
      border-color 0.22s ease,
      box-shadow 0.22s ease;
  }

  .event-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #ef4444;
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  .event-card::after {
    content: "";
    position: absolute;
    right: -40px;
    bottom: -50px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.035);
    pointer-events: none;
  }

  .event-card:hover {
    transform: translateY(-5px);
    border-color: rgba(239, 68, 68, 0.3);
    box-shadow:
      0 18px 38px rgba(18, 22, 30, 0.09);
  }

  .event-card:hover::before {
    opacity: 1;
  }

  .event-card-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .event-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 37px;
    height: 29px;
    border: 1px solid #e5e6ea;
    border-radius: 8px;
    background: #f4f5f7;
    color: #777c88;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: 0.04em;
  }

  .event-arrow {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 9px;
    color: #a1a5ae;
    font-size: 18px;
    transition:
      transform 0.22s ease,
      color 0.22s ease,
      background 0.22s ease;
  }

  .event-card:hover .event-arrow {
    transform: translate(3px, -3px);
    color: #ef4444;
    background: #fff4f4;
  }

  .event-card-title {
    position: relative;
    z-index: 1;
    min-height: 50px;
    margin-top: 22px;
    color: #181a23;
    font-size: 17px;
    line-height: 1.25;
    font-weight: 900;
    letter-spacing: -0.025em;
  }

  .event-card-stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 19px;
  }

  .event-card-stats div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .event-card-stats strong {
    color: #181a23;
    font-size: 21px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .event-card-stats span {
    color: #9da1ab;
    font-size: 9px;
    font-weight: 800;
  }

  .event-card-footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 18px;
    padding-top: 13px;
    border-top: 1px solid #eeeff2;
    font-size: 9px;
    font-weight: 900;
  }

  .event-paid {
    color: #16803c;
  }

  .event-pending {
    color: #bd680c;
  }

  /* =========================================================
     FILTERS
  ========================================================= */

  .filters {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 28px 21px;
    flex-wrap: wrap;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 300px;
    min-height: 43px;
    padding: 0 13px;
    border: 1px solid #e1e3e8;
    border-radius: 11px;
    background: #ffffff;
    box-shadow:
      0 2px 8px rgba(18, 22, 30, 0.025);
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .search-box:focus-within {
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow:
      0 0 0 3px rgba(239, 68, 68, 0.07);
  }

  .search-box span {
    color: #9da2ad;
    font-size: 18px;
  }

  .search-box input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #20232b;
    font-size: 12px;
  }

  .search-box input::placeholder {
    color: #a7abb4;
  }

  .filters select {
    min-height: 43px;
    padding: 0 35px 0 12px;
    border: 1px solid #e1e3e8;
    border-radius: 11px;
    outline: 0;
    background: #ffffff;
    color: #484d58;
    font-size: 10px;
    font-weight: 850;
    box-shadow:
      0 2px 8px rgba(18, 22, 30, 0.02);
  }

  .filters select:focus {
    border-color: rgba(239, 68, 68, 0.45);
  }

  /* =========================================================
     TABLE
  ========================================================= */

  .desktop-table {
    width: 100%;
    overflow-x: auto;
    border-top: 1px solid #eceef1;
  }

  table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
  }

  th {
    padding: 13px 18px;
    text-align: left;
    border-bottom: 1px solid #e9eaee;
    background: #fafbfc;
    color: #999da7;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  td {
    padding: 15px 18px;
    border-bottom: 1px solid #f0f1f3;
    color: #454a55;
    font-size: 11px;
    vertical-align: middle;
  }

  tbody tr {
    transition: background 0.15s ease;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: #fffafa;
  }

  .student-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 210px;
  }

  .student-cell > div:last-child {
    min-width: 0;
  }

  .student-cell strong {
    display: block;
    max-width: 220px;
    overflow: hidden;
    color: #1b1e27;
    font-size: 11px;
    font-weight: 850;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .student-cell span {
    display: block;
    max-width: 220px;
    margin-top: 3px;
    overflow: hidden;
    color: #9da2ac;
    font-size: 9px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .table-avatar {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid #e8e9ed;
    border-radius: 11px;
    background: #f4f5f7;
    color: #4a4f5a;
    font-size: 10px;
    font-weight: 900;
  }

  .registration-number {
    color: #555a65;
    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      monospace;
    font-size: 10px;
    font-weight: 750;
  }

  .table-events {
    display: flex;
    align-items: center;
    gap: 5px;
    max-width: 260px;
    flex-wrap: wrap;
  }

  .mini-chip,
  .event-chip {
    display: inline-flex;
    align-items: center;
    min-height: 23px;
    padding: 0 8px;
    border: 1px solid #e9eaee;
    border-radius: 7px;
    background: #f6f7f8;
    color: #606571;
    font-size: 8px;
    font-weight: 800;
  }

  .more-events {
    color: #9da2ac;
    font-size: 9px;
    font-weight: 850;
  }

  .type-badge {
    display: inline-flex;
    padding: 5px 8px;
    border: 1px solid #e9eaee;
    border-radius: 7px;
    background: #fafafa;
    color: #747985;
    font-size: 8px;
    font-weight: 850;
    text-transform: capitalize;
  }

  .student-count {
    color: #252832;
    font-weight: 900;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 900;
    white-space: nowrap;
  }

  .status-badge.paid {
    color: #137333;
    background: #ecfdf3;
    border: 1px solid #d8f3e3;
  }

  .status-badge.pending {
    color: #a35e0d;
    background: #fff9e9;
    border: 1px solid #f5e7bf;
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .view-button {
    min-height: 32px;
    padding: 0 11px;
    border: 1px solid #e0e2e7;
    border-radius: 8px;
    background: #ffffff;
    color: #464b56;
    font-size: 9px;
    font-weight: 900;
    transition:
      transform 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .view-button:hover {
    transform: translateY(-1px);
    border-color: rgba(239, 68, 68, 0.3);
    background: #fff7f7;
    color: #dc2626;
  }

  .delete-button {
    min-height: 32px;
    padding: 0 11px;
    border: 1px solid #e0e2e7;
    border-radius: 8px;
    background: #ffffff;
    color: #9ca0a8;
    font-size: 9px;
    font-weight: 900;
    transition:
      transform 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .delete-button:hover {
    transform: translateY(-1px);
    border-color: #dc2626;
    background: #dc2626;
    color: #ffffff;
  }

  .delete-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  /* =========================================================
     MOBILE REGISTRATION LIST
  ========================================================= */

  .mobile-list {
    display: none;
  }

  .mobile-registration-card {
    width: 100%;
    padding: 17px;
    text-align: left;
    border: 0;
    border-top: 1px solid #eceef1;
    background: #ffffff;
    cursor: pointer;
  }

  .mobile-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .mobile-card-info {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 16px;
  }

  .mobile-card-info div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mobile-card-info span {
    color: #9da2ac;
    font-size: 8px;
    font-weight: 800;
  }

  .mobile-card-info strong {
    color: #424752;
    font-size: 10px;
    font-weight: 850;
  }

  .mobile-event-name {
    margin-top: 12px;
    color: #7e838e;
    font-size: 9px;
    font-weight: 750;
    line-height: 1.5;
  }

  .mobile-card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #eceef1;
  }

  .mobile-card-actions .delete-button {
    min-height: 30px;
    padding: 0 14px;
    font-size: 9px;
  }

  /* =========================================================
     LOADING / EMPTY
  ========================================================= */

  .loading-state,
  .empty-state {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 45px 20px;
    border-top: 1px solid #eceef1;
    text-align: center;
  }

  .loading-state p,
  .empty-state p {
    margin: 10px 0 0;
    color: #9da2ac;
    font-size: 11px;
  }

  .empty-state h3 {
    margin: 13px 0 0;
    color: #30343d;
    font-size: 15px;
    font-weight: 900;
  }

  .empty-icon {
    width: 50px;
    height: 50px;
    display: grid;
    place-items: center;
    border: 1px solid #e5e6ea;
    border-radius: 15px;
    background: #f5f6f8;
    color: #9da2ac;
    font-size: 22px;
  }

  .loader {
    width: 29px;
    height: 29px;
    border: 3px solid #e5e6ea;
    border-top-color: #ef4444;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* =========================================================
     MODAL
  ========================================================= */

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(13, 15, 21, 0.7);
    backdrop-filter: blur(9px);
  }

  .modal {
    width: min(870px, 100%);
    max-height: calc(100vh - 40px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 21px;
    background: #ffffff;
    box-shadow:
      0 35px 90px rgba(0,0,0,0.3);
    animation: modal-in 0.2s ease-out;
  }

  .verification-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(13, 15, 21, 0.7);
    backdrop-filter: blur(9px);
  }

  .verification-modal {
    width: min(460px, 100%);
    padding: 28px;
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.3);
    animation: modal-in 0.2s ease-out;
  }

  .verification-modal-eyebrow {
    color: #e12a31;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.14em;
  }

  .verification-modal h2 {
    margin: 8px 0 16px;
    color: #171922;
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .verification-modal p {
    margin: 0;
    color: #656a74;
    font-size: 13px;
    line-height: 1.5;
  }

  .verification-registration-number {
    display: block;
    margin-top: 6px;
    color: #171922;
    font-size: 15px;
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .verification-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 24px;
  }

  .verification-modal-actions .verify-button,
  .verification-modal-actions .secondary-button {
    width: auto;
    min-width: 130px;
  }

  /* =========================================================
     DELETE MODAL
  ========================================================= */

  .delete-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(13, 15, 21, 0.7);
    backdrop-filter: blur(9px);
  }

  .delete-modal {
    width: min(460px, 100%);
    padding: 28px;
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 35px 90px rgba(0, 0, 0, 0.3);
    animation: modal-in 0.2s ease-out;
  }

  .delete-modal-eyebrow {
    color: #dc2626;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.14em;
  }

  .delete-modal h2 {
    margin: 8px 0 16px;
    color: #171922;
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .delete-modal p {
    margin: 0;
    color: #656a74;
    font-size: 13px;
    line-height: 1.5;
  }

  .delete-modal-participant {
    display: block;
    margin-top: 6px;
    color: #171922;
    font-size: 15px;
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .delete-modal-reg-number {
    margin-top: 2px;
    color: #9ca0a8;
    font-size: 11px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }

  .delete-modal-warning {
    margin-top: 16px;
    padding: 12px 14px;
    border: 1px solid rgba(220, 38, 38, 0.18);
    border-radius: 10px;
    background: #fef2f2;
    color: #991b1b;
    font-size: 12px;
    line-height: 1.5;
  }

  .delete-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 24px;
  }

  .delete-modal-actions .delete-confirm-button,
  .delete-modal-actions .secondary-button {
    width: auto;
    min-width: 130px;
  }

  .delete-confirm-button {
    width: 100%;
    min-height: 43px;
    padding: 0 16px;
    border: 0;
    border-radius: 11px;
    background: linear-gradient(135deg, #dc2626, #991b1b);
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.03em;
    box-shadow: 0 8px 22px rgba(220, 38, 38, 0.25);
    transition: transform 0.17s ease, box-shadow 0.17s ease, opacity 0.17s ease;
  }

  .delete-confirm-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 13px 30px rgba(220, 38, 38, 0.32);
  }

  .delete-confirm-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  /* =========================================================
     DELETE SECTION IN MODAL
  ========================================================= */

  .delete-section {
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px dashed rgba(220, 38, 38, 0.2);
  }

  .delete-section-desc {
    margin: 6px 0 14px;
    color: #9ca0a8;
    font-size: 12px;
    line-height: 1.5;
  }

  .delete-section-button {
    width: 100%;
    min-height: 43px;
    padding: 0 16px;
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 11px;
    background: #ffffff;
    color: #dc2626;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.03em;
    transition: transform 0.17s ease, background 0.17s ease, color 0.17s ease;
  }

  .delete-section-button:hover {
    background: #dc2626;
    color: #ffffff;
    transform: translateY(-1px);
  }

  .delete-section-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  @keyframes modal-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.985);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    padding: 22px 24px;
    border-bottom: 1px solid #eceef1;
  }

  .modal-header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 90px;
    height: 3px;
    background: #ef4444;
  }

  .modal-eyebrow {
    color: #a0a4ae;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .modal-header h2 {
    margin: 6px 0 0;
    color: #191c24;
    font-size: 21px;
    font-weight: 950;
    letter-spacing: -0.035em;
  }

  .modal-close {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 1px solid #e1e3e8;
    border-radius: 10px;
    background: #ffffff;
    color: #727782;
    font-size: 21px;
    line-height: 1;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .modal-close:hover {
    border-color: rgba(239, 68, 68, 0.25);
    background: #fff6f6;
    color: #dc2626;
  }

  .modal-body {
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    padding: 23px;
  }

  .modal-body::-webkit-scrollbar {
    width: 7px;
  }

  .modal-body::-webkit-scrollbar-track {
    background: #f7f7f8;
  }

  .modal-body::-webkit-scrollbar-thumb {
    border-radius: 99px;
    background: #d4d6db;
  }

  .context-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    padding: 13px 15px;
    border: 1px solid #e6e8ec;
    border-radius: 11px;
    background:
      linear-gradient(
        90deg,
        #fff7f7,
        #fafafa
      );
  }

  .context-banner span {
    color: #9da2ac;
    font-size: 9px;
    font-weight: 800;
  }

  .context-banner strong {
    color: #292d36;
    font-size: 11px;
    font-weight: 900;
  }

  .detail-section {
    padding: 20px 0;
    border-bottom: 1px solid #eceef1;
  }

  .detail-section:first-child {
    padding-top: 0;
  }

  .detail-section:last-child {
    border-bottom: 0;
  }

  .section-title {
    margin-bottom: 13px;
    color: #555a65;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  .section-heading-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .section-heading-row .section-title {
    margin-bottom: 13px;
  }

  .count-pill {
    min-width: 25px;
    height: 25px;
    display: grid;
    place-items: center;
    margin-bottom: 13px;
    border: 1px solid #e6e7eb;
    border-radius: 8px;
    background: #f4f5f7;
    color: #777c87;
    font-size: 9px;
    font-weight: 900;
  }

  .lead-card {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 14px;
    border: 1px solid #e7e8ec;
    border-radius: 13px;
    background: #fafbfc;
  }

  .avatar {
    width: 45px;
    height: 45px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 13px;
    background:
      linear-gradient(
        145deg,
        #f1f2f4,
        #e7e8eb
      );
    color: #414650;
    font-weight: 900;
  }

  .lead-card h3 {
    margin: 0;
    color: #292d35;
    font-size: 14px;
    font-weight: 900;
  }

  .lead-card p {
    margin: 3px 0 0;
    color: #9da2ac;
    font-size: 9px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }

  .detail-item {
    padding: 12px;
    border: 1px solid #e8e9ed;
    border-radius: 10px;
    background: #ffffff;
  }

  .detail-item span,
  .payment-summary span,
  .payment-notes > span {
    display: block;
    color: #a0a4ae;
    font-size: 8px;
    font-weight: 800;
  }

  .detail-item strong {
    display: block;
    margin-top: 4px;
    color: #414650;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.45;
  }

  .participants-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .participant-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e8e9ed;
    border-radius: 10px;
    background: #ffffff;
    transition:
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .participant-row:hover {
    border-color: #dedfe4;
    background: #fafbfc;
  }

  .participant-index {
    width: 27px;
    height: 27px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 8px;
    background: #f4f5f7;
    color: #777c87;
    font-size: 8px;
    font-weight: 900;
  }

  .participant-main {
    min-width: 0;
    flex: 1;
  }

  .participant-main strong {
    display: block;
    color: #3c414b;
    font-size: 10px;
    font-weight: 850;
  }

  .participant-main span {
    display: block;
    margin-top: 2px;
    overflow: hidden;
    color: #a0a4ae;
    font-size: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .participant-meta {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .participant-meta span {
    padding: 4px 7px;
    border-radius: 6px;
    background: #f7f8f9;
    color: #969ba5;
    font-size: 7px;
    font-weight: 850;
  }

  .selected-events {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .muted {
    color: #a0a4ae;
    font-size: 10px;
  }

  /* =========================================================
     PAYMENT
  ========================================================= */

  .payment-section {
    margin: 0 -23px;
    padding-right: 23px;
    padding-left: 23px;
    background: #fafbfc;
  }

  .payment-summary {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .payment-summary > div {
    padding: 12px;
    border: 1px solid #e7e8ec;
    border-radius: 10px;
    background: #ffffff;
  }

  .payment-summary strong {
    display: block;
    margin-top: 5px;
    color: #3d424c;
    font-size: 10px;
    font-weight: 850;
    line-height: 1.45;
  }

  .break-word {
    word-break: break-word;
  }

  .payment-notes {
    margin-top: 10px;
    padding: 12px;
    border: 1px solid #e7e8ec;
    border-radius: 10px;
    background: #ffffff;
  }

  .payment-notes p {
    margin: 7px 0 0;
    color: #656a74;
    font-size: 10px;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  .screenshot-block {
    margin-top: 12px;
  }

  .screenshot-heading {
    margin-bottom: 8px;
    color: #555a65;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .screenshot-link {
    position: relative;
    display: block;
    overflow: hidden;
    border: 1px solid #e2e4e8;
    border-radius: 12px;
    background: #ffffff;
  }

  .screenshot-link img {
    display: block;
    width: 100%;
    max-height: 330px;
    object-fit: contain;
    background: #f7f8f9;
  }

  .screenshot-link span {
    position: absolute;
    right: 10px;
    bottom: 10px;
    padding: 7px 9px;
    border-radius: 7px;
    background: rgba(17, 19, 25, 0.86);
    color: #ffffff;
    font-size: 8px;
    font-weight: 850;
  }

  .no-screenshot,
  .empty-small {
    padding: 13px;
    border: 1px dashed #d1d4da;
    border-radius: 10px;
    color: #a0a4ae;
    font-size: 9px;
  }

  .verify-button {
    width: 100%;
    min-height: 47px;
    margin-top: 14px;
    border: 0;
    border-radius: 11px;
    background:
      linear-gradient(
        135deg,
        #17191f 0%,
        #292c34 100%
      );
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
    box-shadow:
      0 8px 20px rgba(18, 20, 26, 0.16);
    transition:
      transform 0.17s ease,
      box-shadow 0.17s ease,
      opacity 0.17s ease;
  }

  .verify-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 12px 26px rgba(18, 20, 26, 0.23);
  }

  .verify-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  .verified-message {
    margin-top: 14px;
    padding: 13px;
    border: 1px solid #d8f1e2;
    border-radius: 10px;
    background: #ecfdf3;
    color: #16743b;
    text-align: center;
    font-size: 10px;
    font-weight: 900;
  }

  /* =========================================================
     RESPONSIVE
  ========================================================= */

  @media (max-width: 1250px) {
    .stats-grid,
    .event-stats-grid {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }

    .event-grid {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .admin-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
    }

    .stats-grid,
    .event-stats-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .event-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .section-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .result-count,
    .event-count {
      align-self: flex-start;
    }
  }

  @media (max-width: 700px) {
    .admin-page {
      padding: 20px 12px 55px;
    }

    .admin-header {
      margin-bottom: 23px;
    }

    .admin-header h1 {
      font-size: 33px;
    }

    .stats-grid,
    .event-stats-grid,
    .event-grid {
      grid-template-columns: 1fr;
    }

    .event-grid {
      gap: 11px;
      padding: 0 15px 15px;
    }

    .event-card {
  min-height: 155px;
  padding: 14px;
}

    .dashboard-section {
      border-radius: 17px;
    }

    .section-header {
      padding: 22px 16px 18px;
    }

    .section-header h2 {
      font-size: 22px;
    }

    .filters {
      padding: 0 16px 16px;
    }

    .filters select {
      flex: 1 1 140px;
    }

    .desktop-table {
      display: none;
    }

    .mobile-list {
      display: block;
    }

    .detail-grid,
    .payment-summary {
      grid-template-columns: 1fr;
    }

    .modal-backdrop {
      align-items: flex-end;
      padding: 0;
    }

    .modal {
      width: 100%;
      max-height: 94vh;
      border-radius: 20px 20px 0 0;
    }

    .modal-body {
      max-height: calc(94vh - 85px);
      padding: 17px;
    }

    .payment-section {
      margin: 0 -17px;
      padding-right: 17px;
      padding-left: 17px;
    }

    .participant-row {
      align-items: flex-start;
    }

    .participant-meta {
      display: none;
    }

    .header-actions {
      width: 100%;
    }

    .header-actions button {
      flex: 1;
    }
  }

  @media (max-width: 420px) {
    .mobile-card-info {
      grid-template-columns: 1fr 1fr;
    }

    .mobile-card-info div:last-child {
      grid-column: 1 / -1;
    }

    .stat-card {
      min-height: 105px;
    }
  }
      /* =========================================================
     REVIBE RED THEME OVERRIDES
  ========================================================= */

  .admin-page {
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(239, 68, 68, 0.18),
        transparent 30%
      ),
      radial-gradient(
        circle at 100% 18%,
        rgba(239, 68, 68, 0.08),
        transparent 25%
      ),
      linear-gradient(
        135deg,
        #fffafa 0%,
        #f7f7f8 48%,
        #fff5f5 100%
      );
  }

  /* RED LINE UNDER ADMIN HEADER */
  .admin-header {
    border-bottom: 1px solid rgba(239, 68, 68, 0.18);
    padding-bottom: 24px;
  }

  .admin-header::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 90px;
    height: 3px;
    border-radius: 99px;
    background: #ef2029;
    box-shadow: 0 0 14px rgba(239, 32, 41, 0.35);
  }

  .admin-kicker,
  .section-kicker {
    color: #e52b32;
  }

  .admin-header h1 {
    color: #171717;
  }

  /* =========================================================
     STAT CARDS
  ========================================================= */

  .stat-card {
    border-color: rgba(239, 68, 68, 0.18);
    background:
      linear-gradient(
        135deg,
        #ffffff 0%,
        #ffffff 70%,
        #fff2f2 100%
      );
  }

  .stat-card::before {
    width: 5px;
    background: linear-gradient(
      180deg,
      #ed1c24,
      #ff5b61
    );
    opacity: 1;
  }

  .stat-card::after {
    background: rgba(239, 32, 41, 0.07);
  }

  .stat-card:hover {
    border-color: rgba(239, 32, 41, 0.4);
    box-shadow:
      0 16px 35px rgba(239, 32, 41, 0.11);
  }

  .stat-icon {
    border-color: rgba(239, 32, 41, 0.16);
    background:
      linear-gradient(
        145deg,
        #fffafa,
        #ffe9e9
      );
    color: #e31e26;
  }

  .stat-value {
    color: #151515;
  }

  /* =========================================================
     MAIN EVENT SECTION
  ========================================================= */

  .dashboard-section {
    border-color: rgba(239, 68, 68, 0.2);
    background: rgba(255, 255, 255, 0.98);
    box-shadow:
      0 18px 50px rgba(239, 32, 41, 0.06);
  }

  .dashboard-section::before {
    height: 4px;
    background:
      linear-gradient(
        90deg,
        #ed1c24 0%,
        #ed1c24 25%,
        #171717 25%,
        #171717 100%
      );
  }

  .section-header h2 {
    color: #171717;
  }

  .event-count,
  .result-count {
    border-color: rgba(239, 32, 41, 0.2);
    background: #fff3f3;
    color: #dc1f27;
  }

  /* =========================================================
     EVENT CARDS — STRONGER REVIBE LOOK
  ========================================================= */

  .event-card {
    border-color: rgba(239, 68, 68, 0.28);
    background:
      linear-gradient(
        145deg,
        #ffffff 0%,
        #ffffff 62%,
        #fff0f0 100%
      );
    box-shadow:
      0 5px 18px rgba(239, 32, 41, 0.045);
  }

  .event-card::before {
    height: 4px;
    background:
      linear-gradient(
        90deg,
        #ed1c24,
        #ff6066
      );
  }

  .event-card::after {
    width: 145px;
    height: 145px;
    right: -55px;
    bottom: -65px;
    background:
      radial-gradient(
        circle,
        rgba(239, 32, 41, 0.12),
        rgba(239, 32, 41, 0.025) 60%,
        transparent 70%
      );
  }

  .event-card:hover {
    border-color: #ef4444;
    box-shadow:
      0 18px 38px rgba(239, 32, 41, 0.14);
  }

  .event-number {
    border-color: rgba(239, 32, 41, 0.2);
    background: #fff1f1;
    color: #df252c;
  }

  .event-arrow {
    color: #e12a31;
  }

  .event-card:hover .event-arrow {
    color: #ffffff;
    background: #ed1c24;
  }

  .event-card-title {
  min-height: 32px;
  margin-top: 14px;
  font-size: 14px;
}

.event-card-stats {
  gap: 8px;
  margin-top: 10px;
}

.event-card-stats strong {
  font-size: 18px;
}

.event-card-stats span {
  font-size: 8px;
}

.event-card-footer {
  margin-top: 10px;
  padding-top: 9px;
  font-size: 8px;
}

.event-number {
  width: 32px;
  height: 25px;
  font-size: 8px;
}

.event-arrow {
  width: 27px;
  height: 27px;
  font-size: 15px;
}

  /* =========================================================
     FILTERS
  ========================================================= */

  .search-box {
    border-color: rgba(239, 68, 68, 0.2);
  }

  .search-box:focus-within {
    border-color: #ef4444;
    box-shadow:
      0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .filters select {
    border-color: rgba(239, 68, 68, 0.18);
  }

  .filters select:focus {
    border-color: #ef4444;
    box-shadow:
      0 0 0 3px rgba(239, 68, 68, 0.08);
  }

  /* =========================================================
     BUTTONS
  ========================================================= */

  .secondary-button:hover {
    border-color: #ef4444;
    color: #df2028;
  }

  .logout-button {
    border-color: rgba(239, 32, 41, 0.3);
    background: #fff7f7;
    color: #e31e26;
  }

  .logout-button:hover {
    border-color: #ef2024;
    background: #ef2024;
    color: #ffffff;
  }

  .view-button:hover {
    border-color: #ef2024;
    background: #ef2024;
    color: #ffffff;
  }

  /* =========================================================
     STATUS BADGES
  ========================================================= */

  .status-badge.pending {
    color: #d63a20;
    background: #fff1ed;
    border-color: #ffd8d0;
  }

  .status-badge.paid {
    color: #137333;
  }

  /* =========================================================
     MODAL RED ACCENTS
  ========================================================= */

  .modal {
    border-color: rgba(239, 68, 68, 0.2);
    box-shadow:
      0 35px 100px rgba(120, 20, 25, 0.25);
  }

  .modal-header::before {
    width: 120px;
    height: 4px;
    background:
      linear-gradient(
        90deg,
        #ed1c24,
        #ff555b
      );
  }

  .modal-eyebrow {
    color: #e12a31;
  }

  .context-banner {
    border-color: rgba(239, 68, 68, 0.18);
    background:
      linear-gradient(
        90deg,
        #fff0f0,
        #ffffff
      );
  }

  .context-banner strong {
    color: #d91f27;
  }

  .participant-row:hover {
    border-color: rgba(239, 68, 68, 0.25);
    background: #fff8f8;
  }

  /* =========================================================
     PAYMENT / VERIFY
  ========================================================= */

  .payment-section {
    background:
      linear-gradient(
        180deg,
        #fff7f7,
        #fafbfc
      );
  }

  .verify-button {
    background:
      linear-gradient(
        135deg,
        #ed1c24 0%,
        #c9151c 100%
      );
    box-shadow:
      0 8px 22px rgba(237, 28, 36, 0.25);
  }

  .verify-button:hover {
    background:
      linear-gradient(
        135deg,
        #f02028 0%,
        #b91017 100%
      );
    box-shadow:
      0 13px 30px rgba(237, 28, 36, 0.32);
  }

  .verified-message {
    border-color: #bce8cc;
    background: #ecfdf3;
  }

  /* =========================================================
     LOADER
  ========================================================= */

  .loader {
    border-color: #ffd7d9;
    border-top-color: #ed1c24;
  }

  /* =========================================================
     MOBILE
  ========================================================= */

  @media (max-width: 700px) {
    .admin-page {
      background:
        linear-gradient(
          180deg,
          #fff7f7 0%,
          #f7f7f8 45%,
          #fff5f5 100%
        );
    }

    .event-card:hover {
      transform: translateY(-2px);
    }

    .stat-card:hover {
      transform: translateY(-1px);
    }
  }

  /* =========================================================
     REVIBE UI POLISH
  ========================================================= */

  .admin-page {
    --revibe-red: #e31e26;
    --revibe-red-dark: #b9121a;
    --revibe-ink: #171717;
    --revibe-muted: #70747d;
    --revibe-line: rgba(227, 30, 38, 0.2);
    --revibe-surface: rgba(255, 255, 255, 0.94);
    min-height: 100vh;
    color: var(--revibe-ink);
    font-family: 'Hanken Grotesk', sans-serif;
    background:
      radial-gradient(circle at 8% 4%, rgba(227, 30, 38, 0.12), transparent 22%),
      radial-gradient(circle at 96% 18%, rgba(23, 23, 23, 0.05), transparent 20%),
      linear-gradient(135deg, #fffdfd 0%, #f5f5f5 48%, #fff7f7 100%);
  }

  .admin-container {
    width: min(1480px, 100%);
  }

  .admin-header {
    align-items: flex-end;
    margin-bottom: 34px;
    padding: 12px 4px 25px;
    border-bottom: 2px solid var(--revibe-ink);
  }

  .admin-header::before {
    top: -34px;
    left: -24px;
    width: 150px;
    height: 5px;
    background: var(--revibe-red);
  }

  .admin-header::after {
    left: 4px;
    bottom: -4px;
    width: 110px;
    height: 5px;
    border-radius: 0;
    background: var(--revibe-red);
    box-shadow: none;
  }

  .admin-kicker,
  .section-kicker {
    color: var(--revibe-red);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
  }

  .admin-header h1,
  .section-header h2,
  .modal-header h2,
  .verification-modal h2,
  .delete-modal h2 {
    font-family: 'Anton', sans-serif;
    font-weight: 400;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .admin-header h1 {
    margin: 10px 0 9px;
    color: var(--revibe-ink);
    font-size: clamp(38px, 5vw, 64px);
    line-height: 0.96;
  }

  .admin-header p,
  .section-header p {
    color: var(--revibe-muted);
  }

  .header-actions {
    gap: 10px;
  }

  .secondary-button,
  .logout-button,
  .view-button {
    border-color: var(--revibe-line);
    border-radius: 8px;
    background: #ffffff;
    color: var(--revibe-ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .secondary-button:hover,
  .logout-button:hover,
  .view-button:hover {
    border-color: var(--revibe-red);
    background: var(--revibe-ink);
    color: #ffffff;
  }

  .logout-button {
    color: var(--revibe-red);
  }

  .stats-grid {
    gap: 15px;
    margin-bottom: 34px;
  }

  .stat-card {
    min-height: 132px;
    padding: 21px;
    border: 1px solid var(--revibe-line);
    border-radius: 12px;
    background: var(--revibe-surface);
    box-shadow: 0 10px 26px rgba(23, 23, 23, 0.06);
  }

  .stat-card::before {
    width: 4px;
    background: var(--revibe-red);
  }

  .stat-card::after {
    right: -28px;
    bottom: -44px;
    width: 110px;
    height: 110px;
    border: 1px solid rgba(227, 30, 38, 0.08);
    background: transparent;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    border-color: rgba(227, 30, 38, 0.45);
    box-shadow: 0 17px 34px rgba(227, 30, 38, 0.1);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border: 1px solid rgba(227, 30, 38, 0.22);
    border-radius: 9px;
    background: var(--revibe-ink);
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 21px;
    font-weight: 400;
  }

  .stat-label,
  .stat-subtext,
  .event-card-stats span,
  .event-card-footer,
  .payment-summary span,
  .detail-item span {
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
  }

  .stat-label {
    color: var(--revibe-muted);
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  .stat-value {
    margin-top: 7px;
    color: var(--revibe-ink);
    font-family: 'Anton', sans-serif;
    font-size: 35px;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .dashboard-section {
    margin-top: 30px;
    border: 1px solid var(--revibe-line);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 18px 44px rgba(23, 23, 23, 0.06);
  }

  .dashboard-section::before {
    height: 5px;
    background: linear-gradient(90deg, var(--revibe-red) 0 24%, var(--revibe-ink) 24% 100%);
  }

  .section-header {
    padding: 32px 30px 25px;
  }

  .section-header h2 {
    margin: 8px 0 7px;
    color: var(--revibe-ink);
    font-size: clamp(25px, 3vw, 34px);
    line-height: 1;
  }

  .section-header p {
    font-size: 12px;
  }

  .event-count,
  .result-count {
    min-height: 32px;
    border-color: var(--revibe-line);
    border-radius: 7px;
    background: #fff1f1;
    color: var(--revibe-red-dark);
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .event-grid {
    gap: 16px;
    padding: 0 30px 30px;
  }

  .event-card {
    min-height: 190px;
    padding: 20px;
    border: 1px solid var(--revibe-line);
    border-radius: 10px;
    background: linear-gradient(145deg, #ffffff 0%, #ffffff 66%, #fff3f3 100%);
    box-shadow: 0 7px 19px rgba(23, 23, 23, 0.05);
  }

  .event-card::before {
    height: 5px;
    background: var(--revibe-red);
  }

  .event-card:hover {
    transform: translateY(-5px);
    border-color: var(--revibe-red);
    box-shadow: 0 18px 34px rgba(227, 30, 38, 0.14);
  }

  .event-number {
    width: 39px;
    height: 30px;
    border: 0;
    border-radius: 5px;
    background: var(--revibe-ink);
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
  }

  .event-arrow {
    color: var(--revibe-red);
  }

  .event-card-title {
    min-height: 48px;
    margin-top: 20px;
    color: var(--revibe-ink);
    font-family: 'Anton', sans-serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: 0.025em;
    line-height: 1.1;
    text-transform: uppercase;
  }

  .event-card-stats {
    gap: 14px;
    margin-top: 18px;
  }

  .event-card-stats strong {
    color: var(--revibe-red-dark);
    font-family: 'Anton', sans-serif;
    font-size: 27px;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .event-card-stats span {
    color: var(--revibe-muted);
    font-size: 8px;
    letter-spacing: 0.06em;
  }

  .event-card-footer {
    margin-top: 18px;
    padding-top: 13px;
    border-top-color: var(--revibe-line);
    font-size: 8px;
    letter-spacing: 0.04em;
  }

  .event-paid {
    color: #187a3d;
  }

  .event-pending {
    color: var(--revibe-red-dark);
  }

  .filters {
    gap: 10px;
    padding: 0 30px 22px;
  }

  .search-box,
  .filters select {
    min-height: 45px;
    border-color: var(--revibe-line);
    border-radius: 8px;
    background: #ffffff;
  }

  .search-box:focus-within,
  .filters select:focus {
    border-color: var(--revibe-red);
    box-shadow: 0 0 0 3px rgba(227, 30, 38, 0.1);
  }

  .filters select,
  .search-box input {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
  }

  .desktop-table {
    border-top-color: var(--revibe-line);
  }

  th {
    padding: 14px 18px;
    background: #fff5f5;
    color: var(--revibe-red-dark);
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.1em;
  }

  td {
    padding: 17px 18px;
    border-bottom-color: rgba(227, 30, 38, 0.1);
  }

  tbody tr:hover {
    background: #fffafa;
  }

  .student-cell strong {
    color: var(--revibe-ink);
    font-size: 12px;
  }

  .student-cell span,
  .mobile-card-info span {
    color: #878b94;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
  }

  .table-avatar {
    border-color: var(--revibe-line);
    border-radius: 8px;
    background: var(--revibe-ink);
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 16px;
    font-weight: 400;
  }

  .registration-number {
    color: var(--revibe-red-dark);
    font-weight: 800;
  }

  .mini-chip,
  .event-chip,
  .type-badge {
    border-color: var(--revibe-line);
    border-radius: 5px;
    background: #fff5f5;
    color: var(--revibe-red-dark);
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
  }

  .status-badge {
    padding: 6px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .status-badge.paid {
    border-color: #c7e8d2;
    background: #effbf3;
    color: #187a3d;
  }

  .status-badge.pending {
    border-color: #ffd0ca;
    background: #fff2ef;
    color: var(--revibe-red-dark);
  }

  .view-button {
    min-height: 34px;
    padding: 0 13px;
  }

  .delete-button {
    min-height: 34px;
    padding: 0 13px;
  }

  .mobile-registration-card {
    padding: 18px 16px;
    border-top-color: var(--revibe-line);
    background: #ffffff;
  }

  .mobile-card-info {
    margin-top: 17px;
  }

  .mobile-card-info strong {
    color: var(--revibe-ink);
    font-family: 'Anton', sans-serif;
    font-size: 18px;
    font-weight: 400;
  }

  .mobile-event-name {
    color: var(--revibe-red-dark);
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .modal-backdrop,
  .verification-modal-backdrop,
  .delete-modal-backdrop {
    background: rgba(23, 23, 23, 0.78);
    backdrop-filter: blur(10px);
  }

  .modal {
    border: 1px solid rgba(227, 30, 38, 0.28);
    border-radius: 14px;
    box-shadow: 0 30px 90px rgba(23, 23, 23, 0.28);
  }

  .modal-header {
    padding: 25px 27px 22px;
    border-bottom-color: var(--revibe-line);
  }

  .modal-header::before {
    width: 145px;
    height: 5px;
    background: var(--revibe-red);
  }

  .modal-eyebrow,
  .verification-modal-eyebrow,
  .delete-modal-eyebrow,
  .section-title,
  .screenshot-heading {
    color: var(--revibe-red);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .modal-header h2 {
    margin-top: 8px;
    color: var(--revibe-ink);
    font-size: 29px;
  }

  .modal-close {
    border-color: var(--revibe-line);
    border-radius: 8px;
    color: var(--revibe-red);
  }

  .modal-close:hover {
    border-color: var(--revibe-red);
    background: var(--revibe-ink);
    color: #ffffff;
  }

  .modal-body {
    padding: 25px 27px;
  }

  .detail-section {
    padding: 22px 0;
    border-bottom-color: var(--revibe-line);
  }

  .detail-section:first-child {
    padding-top: 0;
  }

  .section-title {
    margin-bottom: 14px;
    font-size: 9px;
  }

  .lead-card,
  .detail-item,
  .participant-row,
  .payment-summary > div,
  .payment-notes,
  .screenshot-link {
    border-color: var(--revibe-line);
    border-radius: 8px;
    background: #ffffff;
  }

  .lead-card {
    padding: 16px;
  }

  .avatar {
    border-radius: 8px;
    background: var(--revibe-ink);
    color: #ffffff;
    font-family: 'Anton', sans-serif;
    font-size: 20px;
    font-weight: 400;
  }

  .lead-card h3 {
    color: var(--revibe-ink);
    font-family: 'Anton', sans-serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .detail-item,
  .payment-summary > div {
    padding: 14px;
  }

  .detail-item strong,
  .payment-summary strong {
    color: var(--revibe-ink);
  }

  .payment-section {
    background: linear-gradient(180deg, #fff5f5, #ffffff);
  }

  .payment-summary {
    gap: 11px;
  }

  .payment-summary span,
  .detail-item span {
    color: #858991;
    font-size: 8px;
    letter-spacing: 0.06em;
  }

  .screenshot-block {
    margin-top: 15px;
  }

  .screenshot-heading {
    margin-bottom: 9px;
    font-size: 8px;
  }

  .verify-button {
    min-height: 49px;
    margin-top: 16px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--revibe-red), var(--revibe-red-dark));
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .verify-button:hover {
    background: var(--revibe-ink);
  }

  .verified-message {
    margin-top: 16px;
    padding: 14px;
    border-color: #bfe4ca;
    border-radius: 8px;
    background: #effbf3;
    color: #187a3d;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .verification-modal,
  .delete-modal {
    border-radius: 12px;
    border-top: 5px solid var(--revibe-red);
  }

  .verification-modal h2,
  .delete-modal h2 {
    color: var(--revibe-ink);
  }

  .verification-modal-actions .verify-button,
  .verification-modal-actions .secondary-button,
  .delete-modal-actions .delete-confirm-button,
  .delete-modal-actions .secondary-button {
    min-height: 43px;
  }

  @media (max-width: 700px) {
    .admin-page {
      padding: 24px 14px 60px;
    }

    .admin-header {
      margin-bottom: 26px;
      padding: 8px 2px 21px;
    }

    .admin-header h1 {
      font-size: 42px;
    }

    .header-actions {
      gap: 8px;
    }

    .header-actions button {
      min-width: 0;
      padding-inline: 10px;
      font-size: 9px;
    }

    .stats-grid {
      gap: 10px;
      margin-bottom: 24px;
    }

    .stat-card {
      min-height: 112px;
      padding: 16px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
    }

    .stat-value {
      font-size: 30px;
    }

    .dashboard-section {
      margin-top: 22px;
      border-radius: 12px;
    }

    .section-header {
      padding: 25px 17px 20px;
    }

    .section-header h2 {
      font-size: 27px;
    }

    .event-grid {
      gap: 11px;
      padding: 0 16px 17px;
    }

    .event-card {
      min-height: 170px;
      padding: 16px;
    }

    .event-card-title {
      min-height: 40px;
      margin-top: 16px;
      font-size: 18px;
    }

    .filters {
      gap: 8px;
      padding: 0 16px 17px;
    }

    .search-box,
    .filters select {
      min-height: 43px;
    }

    .modal-body {
      padding: 20px 17px;
    }

    .modal-header {
      padding: 22px 17px 19px;
    }

    .modal-header h2 {
      font-size: 26px;
    }

    .verification-modal {
      padding: 23px 19px;
    }

    .verification-modal-actions {
      flex-direction: column-reverse;
    }

    .verification-modal-actions .verify-button,
    .verification-modal-actions .secondary-button {
      width: 100%;
    }

    .delete-modal {
      padding: 23px 19px;
    }

    .delete-modal-actions {
      flex-direction: column-reverse;
    }

    .delete-modal-actions .delete-confirm-button,
    .delete-modal-actions .secondary-button {
      width: 100%;
    }
  }
`;