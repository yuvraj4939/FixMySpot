import Report from "../models/Report.js";

const ALLOWED_CATEGORIES = ["Road", "Electricity", "Water", "Cleanliness", "Safety", "Public Property"];
const ALLOWED_SEVERITIES = ["Low", "Medium", "High"];
const ALLOWED_STATUSES = ["Reported", "Community Verified", "In Progress", "Fixed"];

function priority(report) {
  const severityScore = { Low: 15, Medium: 35, High: 55 }[report.severity] || 15;
  const days = Math.max(0, Math.floor((Date.now() - new Date(report.createdAt).getTime()) / 86400000));
  return Math.min(100, severityScore + (report.confirmations || 0) * 2 + Math.min(days * 2, 25));
}

function serialize(report) {
  const data = report.toObject();
  return { ...data, id: report._id.toString(), priority: priority(report) };
}

export async function list(req, res) {
  const filter = {};
  if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
  if (req.query.status && req.query.status !== "All") filter.status = req.query.status;
  if (req.query.mine === "true") filter.reporter = req.user._id;

  const rows = await Report.find(filter)
    .populate("reporter", "name email")
    .sort({ createdAt: -1 });

  return res.json({ reports: rows.map(serialize) });
}

export async function get(req, res) {
  const report = await Report.findById(req.params.id).populate("reporter", "name email");
  if (!report) return res.status(404).json({ message: "Report not found" });
  return res.json({ report: serialize(report) });
}

export async function create(req, res) {
  const title = req.body.title?.trim();
  const category = req.body.category;
  const severity = req.body.severity || "Medium";
  const description = req.body.description?.trim();
  const address = req.body.address?.trim() || "";
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!title || !description || !category || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ message: "Title, category, description and valid coordinates are required" });
  }
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Invalid report category" });
  }
  if (!ALLOWED_SEVERITIES.includes(severity)) {
    return res.status(400).json({ message: "Invalid report severity" });
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ message: "Coordinates are out of range" });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
  const report = await Report.create({
    title,
    category,
    severity,
    description,
    location: { address, latitude, longitude },
    imageUrl,
    reporter: req.user._id
  });

  return res.status(201).json({ report: serialize(report) });
}

export async function confirm(req, res) {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  if (report.confirmedBy.some((id) => id.toString() === req.user._id.toString())) {
    return res.status(409).json({ message: "You already confirmed this report" });
  }

  report.confirmedBy.push(req.user._id);
  report.confirmations += 1;
  if (report.confirmations >= 5 && report.status === "Reported") {
    report.status = "Community Verified";
  }

  await report.save();
  return res.json({ report: serialize(report) });
}

export async function status(req, res) {
  const nextStatus = req.body.status;
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: nextStatus },
    { new: true, runValidators: true }
  );

  if (!report) return res.status(404).json({ message: "Report not found" });
  return res.json({ report: serialize(report) });
}

export async function stats(_req, res) {
  const [total, active, fixed, high] = await Promise.all([
    Report.countDocuments(),
    Report.countDocuments({ status: { $ne: "Fixed" } }),
    Report.countDocuments({ status: "Fixed" }),
    Report.countDocuments({ severity: "High", status: { $ne: "Fixed" } })
  ]);

  return res.json({ total, active, fixed, high });
}
