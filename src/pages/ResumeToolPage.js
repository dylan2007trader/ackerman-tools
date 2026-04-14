import React, { useState, useEffect } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

import ScoreCard from "../components/resume/ScoreCard";
import StatsGrid from "../components/resume/StatsGrid";
import ImprovementSections from "../components/resume/ImprovementSections";
import PremiumUpsell from "../components/resume/PremiumUpsell";
import AuthModal from "../components/auth/AuthModal";

import { analyzeResume } from "../utils/resumeAnalyzer";
import { buildPremiumResume, downloadResumeText, downloadResumeDocx } from "../utils/resumeUpgrader";
import {
  buildCoverLetter,
  buildCoverLetterText,
  downloadCoverLetterText,
  printCoverLetterPdf,
} from "../services/coverBuilder";
import {
  APP_IDS,
  getCurrentUser,
  hasPurchasedApp,
  startCheckout,
  confirmCheckout,
} from "../services/accountStore";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const APP_ID = APP_IDS.RESUME_SUITE;

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += `${pageText}\n`;
  }

  return fullText;
}

async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

async function readResumeFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt")) {
    return file.text();
  }

  if (name.endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }

  if (name.endsWith(".docx")) {
    return extractTextFromDocx(file);
  }

  if (name.endsWith(".doc")) {
    throw new Error(
      "Old .doc files are not supported well. Please upload PDF, DOCX, or TXT."
    );
  }

  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}

function ScoreBar({ label, value, note }) {
  const safeValue = Math.max(0, Math.min(10, Number(value) || 0));

  return (
    <div style={styles.scoreBarRow}>
      <div style={styles.scoreBarTop}>
        <span>{label}</span>
        <strong>{safeValue}/10</strong>
      </div>
      <div style={styles.scoreBarTrack}>
        <div
          style={{
            ...styles.scoreBarFill,
            width: `${(safeValue / 10) * 100}%`,
          }}
        />
      </div>
      {note ? <div style={styles.scoreBarNote}>{note}</div> : null}
    </div>
  );
}

function Pill({ children, tone = "default" }) {
  const toneStyles =
    tone === "success"
      ? styles.pillSuccess
      : tone === "warning"
      ? styles.pillWarning
      : styles.pillDefault;

  return <div style={{ ...styles.pill, ...toneStyles }}>{children}</div>;
}

export default function ResumeToolPage() {
  const [role, setRole] = useState("software engineer");
  const [targetType, setTargetType] = useState("job");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [premiumMessage, setPremiumMessage] = useState("");

  // Premium output state
  const [premiumTab, setPremiumTab] = useState("resume");
  const [generatedResume, setGeneratedResume] = useState("");
  const [missingItems, setMissingItems] = useState([]);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const isPremium = hasPurchasedApp(APP_IDS.RESUME_SUITE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const sessionId = params.get("session_id");
    if (checkoutStatus === "success" && sessionId) {
      window.history.replaceState({}, "", "/resume-builder");
      confirmCheckout(sessionId)
        .then((result) => {
          if (result?.user) {
            setCurrentUser(result.user);
            setPremiumMessage("Premium is now active! You can generate your upgraded resume below.");
          }
        })
        .catch(() => setPremiumMessage("Payment received — please refresh to activate premium."));
    } else if (checkoutStatus === "cancelled") {
      window.history.replaceState({}, "", "/resume-builder");
      setPremiumMessage("Checkout cancelled. No charge was made.");
    }
  }, []);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setPremiumMessage("");
    setIsLoadingFile(true);
    setFileName(file.name);

    try {
      const text = await readResumeFile(file);
      setResumeText(text);
      setAnalysis(null);
    } catch (err) {
      setError(err.message || "Could not read that file.");
      setResumeText("");
    } finally {
      setIsLoadingFile(false);
    }
  }

  async function handleAnalyze() {
    setError("");
    setPremiumMessage("");

    if (!resumeText.trim()) {
      setError("Upload your resume or paste the text first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const nextAnalysis = analyzeResume(resumeText, role, targetType);
      setAnalysis(nextAnalysis);
    } catch (err) {
      setError("Something went wrong while analyzing the resume.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handlePremiumUpgrade() {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    try {
      setPremiumMessage("Redirecting to checkout...");
      const returnUrl = window.location.origin + "/resume-builder";
      const result = await startCheckout(APP_IDS.RESUME_SUITE, returnUrl);
      if (result.url) {
        window.location.href = result.url;
      } else if (result.user) {
        setCurrentUser(result.user);
        setPremiumMessage("Premium is now active!");
      } else {
        setPremiumMessage("Could not start checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setPremiumMessage("Could not start checkout. Please try again.");
    }
  }

  function handleGenerateResume() {
    if (!isPremium) {
      handlePremiumUpgrade();
      return;
    }
    if (!resumeText.trim()) {
      setError("Upload your resume first, then generate the upgrade.");
      return;
    }
    setIsGeneratingResume(true);
    setError("");
    try {
      const { upgradedResume, missingItems: missing } = buildPremiumResume(
        resumeText,
        role,
        analysis || {}
      );
      setGeneratedResume(upgradedResume);
      setMissingItems(missing);
      setPremiumTab("resume");
    } catch (err) {
      setError("Could not generate the upgraded resume.");
      console.error(err);
    } finally {
      setIsGeneratingResume(false);
    }
  }

  function handleGenerateCoverLetter() {
    if (!isPremium) {
      handlePremiumUpgrade();
      return;
    }
    if (!resumeText.trim()) {
      setError("Upload your resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Paste a job description before generating the cover letter.");
      return;
    }
    setIsGeneratingCoverLetter(true);
    setError("");
    try {
      const letter = buildCoverLetter({
        resumeText,
        jobDescription,
        targetRole: role,
      });
      setGeneratedCoverLetter(letter);
      setPremiumTab("cover");
    } catch (err) {
      setError("Could not generate the cover letter.");
      console.error(err);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  }

  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice("Copied to clipboard!");
      setTimeout(() => setCopyNotice(""), 2500);
    } catch {
      setCopyNotice("Copy failed — select the text manually.");
      setTimeout(() => setCopyNotice(""), 2500);
    }
  }

  async function handleDownloadResumeDocx() {
    if (!generatedResume) return;
    try {
      await downloadResumeDocx(generatedResume, "upgraded_resume.docx");
    } catch (err) {
      setError("DOCX download failed. Try the text download instead.");
      console.error(err);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <a href="/" style={{ display: "inline-block", marginBottom: "12px", color: "#94a3b8", fontSize: "13px", textDecoration: "none" }}>← Back to Ackerman Tools</a>
        <div style={styles.heroBadge}>resume builder + cover letter generator</div>
        <h1 style={styles.heroTitle}>Resume grader</h1>
        <p style={styles.heroSubtitle}>
          Upload your resume, choose your target role, and get a harsher score
          based on keywords, ATS fit, bullet quality, structure, and impact.
        </p>
      </div>

<div style={styles.topPremiumWrap}>
  <PremiumUpsell
    isPremium={isPremium}
    onUpgrade={handlePremiumUpgrade}
    title="Unlock the upgraded resume + tailored cover letter"
    subtitle={
      isPremium
        ? "Premium is active on your account. You can now generate upgraded resume and cover letter outputs."
        : "Start with the free grader, then unlock one stronger reusable resume plus unlimited tailored cover letters for related jobs."
    }
    priceText="$10/month"
    buttonText={isPremium ? "Premium Active" : "Unlock Premium"}
  />
</div>

      <div style={styles.panel}>
        <div style={styles.controlsGrid}>
          <div style={styles.controlCard}>
            <div style={styles.cardLabel}>1. Upload resume</div>
            <label style={styles.uploadBox}>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <span style={styles.uploadTitle}>
                {isLoadingFile ? "Reading file..." : "Choose PDF, DOCX, or TXT"}
              </span>
              <span style={styles.uploadSubtext}>
                {fileName ? `Loaded: ${fileName}` : "Or paste your resume below"}
              </span>
            </label>
          </div>

          <div style={styles.controlCard}>
            <div style={styles.cardLabel}>2. Choose role track</div>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              style={styles.select}
            >
              <option value="software engineer">Software Engineer</option>
              <option value="data scientist">Data Scientist</option>
              <option value="backend developer">Backend Developer</option>
              <option value="frontend developer">Frontend Developer</option>
              <option value="full stack developer">Full Stack Developer</option>
            </select>
          </div>

          <div style={styles.controlCard}>
            <div style={styles.cardLabel}>3. Choose target type</div>
            <select
              value={targetType}
              onChange={(event) => setTargetType(event.target.value)}
              style={styles.select}
            >
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <div style={styles.textAreaGrid}>
          <div style={styles.textBlock}>
            <div style={styles.cardLabel}>Resume text</div>
            <textarea
              value={resumeText}
              onChange={(event) => {
                setResumeText(event.target.value);
                setAnalysis(null);
              }}
              placeholder="Paste your resume text here if you do not want to upload a file."
              style={styles.textarea}
            />
          </div>

          <div style={styles.textBlock}>
            <div style={styles.cardLabel}>
              Job description
              {!isPremium && (
                <span style={styles.premiumTag}>Premium</span>
              )}
            </div>
            {isPremium ? (
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the full job description here. The cover letter generator will use it to tailor your letter to this specific role and company."
                style={styles.textarea}
              />
            ) : (
              <div style={styles.lockedBox}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: "#fde68a" }}>
                  Unlock to access cover letter generation
                </div>
                Paste a job description here after unlocking premium ($10/month).
                The cover letter generator will write a tailored 3-paragraph letter
                using your resume and this job description.
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={handlePremiumUpgrade}
                    style={styles.unlockButton}
                  >
                    Unlock Premium — $10/mo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}
        {premiumMessage ? <div style={styles.notice}>{premiumMessage}</div> : null}

        <div style={styles.actionRow}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isLoadingFile}
            style={{
              ...styles.primaryButton,
              opacity: isAnalyzing || isLoadingFile ? 0.7 : 1,
              cursor: isAnalyzing || isLoadingFile ? "not-allowed" : "pointer",
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze resume"}
          </button>
        </div>
      </div>

      {analysis ? (
        <div style={styles.results}>
          <ScoreCard analysis={analysis} />
          <StatsGrid analysis={analysis} />
          <ImprovementSections analysis={analysis} />

          <div style={styles.deepGrid}>
            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Visual score map</h3>
              <div style={styles.scoreBarStack}>
                <ScoreBar
                  label="Structure"
                  value={analysis.breakdown?.structure}
                  note="Header, sections, readability, and layout signals"
                />
                <ScoreBar
                  label="Keywords"
                  value={analysis.breakdown?.keywords}
                  note="Role targeting and technical signal coverage"
                />
                <ScoreBar
                  label="Projects"
                  value={analysis.breakdown?.projects}
                  note="Project presence and technical depth"
                />
                <ScoreBar
                  label="Experience impact"
                  value={analysis.breakdown?.experienceImpact}
                  note="Ownership language and accomplishment framing"
                />
                <ScoreBar
                  label="Metrics"
                  value={analysis.breakdown?.metrics}
                  note="How often bullets show proof with numbers"
                />
                <ScoreBar
                  label="Achievement strength"
                  value={analysis.breakdown?.achievementStrength}
                  note="Strength of bullets overall"
                />
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Key stats</h3>
              <div style={styles.statCardGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statLabel}>Achievement lines</span>
                  <strong style={styles.statValue}>
                    {analysis.achievementLineCount || 0}
                  </strong>
                  <p style={styles.statText}>
                    {analysis.achievementLineCount >= 8
                      ? "Good volume. You have enough bullet-style accomplishments to work with."
                      : analysis.achievementLineCount >= 4
                      ? "Decent base, but adding more accomplishment-driven bullets would help."
                      : "Too few clear accomplishment lines. Add bullets that show what you did and why it mattered."}
                  </p>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statLabel}>Lines with metrics</span>
                  <strong style={styles.statValue}>
                    {analysis.linesWithMetricsCount || 0}
                  </strong>
                  <p style={styles.statText}>
                    {analysis.linesWithMetricsCount >= 4
                      ? "Strong proof. Multiple bullets show measurable evidence."
                      : analysis.linesWithMetricsCount >= 2
                      ? "Some proof is present, but more numbers would make the resume more credible."
                      : "Very little measurable proof. Add numbers like %, users, time saved, revenue, or scale."}
                  </p>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statLabel}>Technical depth</span>
                  <strong style={styles.statValue}>
                    {analysis.technicalMatches?.length || 0}
                  </strong>
                  <p style={styles.statText}>
                    {analysis.technicalMatches?.length >= 10
                      ? "Strong technical signal coverage for the role."
                      : analysis.technicalMatches?.length >= 5
                      ? "Some relevant technical signals are present, but there is room to strengthen them."
                      : "The resume is not showing enough relevant technical keywords or tools yet."}
                  </p>
                </div>

                <div style={styles.statCard}>
                  <span style={styles.statLabel}>Word count</span>
                  <strong style={styles.statValue}>
                    {analysis.wordCount || 0}
                  </strong>
                  <p style={styles.statText}>
                    {analysis.wordCount >= 350 && analysis.wordCount <= 700
                      ? "This is in a healthy range for a focused one-page technical resume."
                      : analysis.wordCount < 350
                      ? "This may be too thin. You may not be showing enough projects, bullets, or detail."
                      : "This may be too dense. Tightening wording could make the resume easier to scan."}
                  </p>
                </div>
              </div>

              <div style={styles.stackGap}>
                {(analysis.scoreDrivers || []).map((item, idx) => (
                  <div key={idx} style={styles.noteBlue}>
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Section ratings</h3>
              <div style={styles.scoreBarStack}>
                <ScoreBar
                  label="Header / Contact"
                  value={analysis.sectionScores?.header}
                />
                <ScoreBar
                  label="Education"
                  value={analysis.sectionScores?.education}
                />
                <ScoreBar
                  label="Experience"
                  value={analysis.sectionScores?.experience}
                />
                <ScoreBar
                  label="Projects"
                  value={analysis.sectionScores?.projects}
                />
                <ScoreBar
                  label="Skills"
                  value={analysis.sectionScores?.skills}
                />
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Detected structure evidence</h3>
              <div style={styles.stackGap}>
                {(analysis.structureEvidence || []).map((item, idx) => (
                  <div key={idx} style={styles.noteBlue}>
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Strong action examples</h3>
              <div style={styles.stackGap}>
                {(analysis.strongExamples || []).map((item, idx) => (
                  <div key={idx} style={styles.note}>
                    • {item}
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Weak phrasing found</h3>
              <div style={styles.stackGap}>
                {(analysis.weakExamples || []).map((item, idx) => (
                  <div key={idx} style={styles.note}>
                    • {item}
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>Checklist</h3>
              <div style={styles.stackGap}>
                {[
                  {
                    label: "Contact info",
                    passed: analysis.contactChecks?.hasEmail,
                  },
                  {
                    label: "Education section",
                    passed: analysis.sectionsFound?.education,
                  },
                  {
                    label: "Experience section",
                    passed: analysis.sectionsFound?.experience,
                  },
                  {
                    label: "Projects section",
                    passed: analysis.sectionsFound?.projects,
                  },
                  {
                    label: "Skills section",
                    passed: analysis.sectionsFound?.skills,
                  },
                  {
                    label: "Achievement lines detected",
                    passed: (analysis.achievementLineCount || 0) >= 3,
                  },
                  {
                    label: "Lines with metrics",
                    passed: (analysis.linesWithMetricsCount || 0) >= 2,
                  },
                  {
                    label: "Strong action language",
                    passed: (analysis.actionVerbRate || 0) >= 40,
                  },
                  {
                    label: "Role-specific keywords",
                    passed: (analysis.keywordMatchScore || 0) >= 45,
                  },
                  {
                    label: "Professional links",
                    passed:
                      analysis.contactChecks?.hasLinkedIn ||
                      analysis.contactChecks?.hasGitHub,
                  },
                ].map((item, idx) => (
                  <div key={idx} style={styles.checkRow}>
                    <span>{item.label}</span>
                    <strong
                      style={{
                        color: item.passed ? "#86efac" : "#fca5a5",
                      }}
                    >
                      {item.passed ? "Pass" : "Fix"}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.dashboardCard}>
              <h3 style={styles.sectionTitle}>What is already working</h3>
              <div style={styles.stackGap}>
                {[
                  analysis.technicalMatches?.length >= 6
                    ? "Strong technical keyword coverage for the target role."
                    : null,
                  analysis.linesWithMetricsCount >= 2
                    ? "You already show measurable proof in multiple places."
                    : null,
                  analysis.hasProjects
                    ? "Projects section helps show initiative and technical depth."
                    : null,
                  analysis.strongExamples?.length >= 3
                    ? "Several bullets already use strong action language."
                    : null,
                  analysis.contactChecks?.hasLinkedIn
                    ? "Your header already includes core contact signals."
                    : null,
                ]
                  .filter(Boolean)
                  .map((item, idx) => (
                    <div key={idx} style={styles.noteSuccess}>
                      {item}
                    </div>
                  ))}
              </div>
            </section>
          </div>

          <section style={styles.nextSection}>
            <h3 style={styles.sectionTitle}>What to improve next</h3>
            <div style={styles.stackGap}>
              {[
                !analysis.sectionsFound?.summary
                  ? "Add a short professional summary at the top so recruiters immediately understand your fit for the target role."
                  : null,
                analysis.linesWithMetricsCount < 4
                  ? "A few more lines with numbers would strengthen the resume. Add metrics like users, projects, time saved, datasets processed, or performance improvements."
                  : null,
                analysis.weakExamples?.length
                  ? "Some bullets still sound passive. Replace phrases like helped, assisted, contributed, or worked on with stronger ownership language."
                  : null,
                !analysis.contactChecks?.hasGitHub && role !== "data scientist"
                  ? "Add your GitHub if you have class projects, personal builds, or code samples worth showing."
                  : null,
                /soft skills/i.test(analysis.rawText || "")
                  ? "Remove the separate soft skills section and show those strengths through stronger project and experience bullets instead."
                  : null,
              ]
                .filter(Boolean)
                .map((item, idx) => (
                  <div key={idx} style={styles.noteWarning}>
                    {item}
                  </div>
                ))}
            </div>
          </section>

          <div style={styles.premiumInfoGrid}>
            <section style={styles.dashboardCard}>
              <div style={styles.eyebrowSmall}>premium value</div>
              <h3 style={styles.sectionTitle}>What premium actually gives the user</h3>
              <ul style={styles.bulletList}>
                <li>One stronger resume they can keep reusing</li>
                <li>Unlimited fresh cover letters from related job descriptions</li>
                <li>Cleaner premium outputs and export controls</li>
              </ul>
            </section>

            <section style={styles.dashboardCard}>
              <div style={styles.eyebrowSmall}>cover letter strategy</div>
              <h3 style={styles.sectionTitle}>
                How the builder writes the letter before the user presses generate
              </h3>
              <ol style={styles.numberList}>
                <li>
                  Paragraph one explains what the job is for and why the role matters.
                </li>
                <li>
                  Paragraph two explains what the candidate actually does using
                  evidence from the resume.
                </li>
                <li>
                  Paragraph three maps those strengths to the company’s needs and
                  states the value the candidate would bring.
                </li>
              </ol>
            </section>
          </div>

          {/* Premium generate buttons */}
          <div style={styles.premiumGenerateRow}>
            <div style={styles.premiumLockedRow}>
              <h3 style={styles.generateTitle}>
                Premium outputs
              </h3>
              <span style={isPremium ? styles.lockBadgeActive : styles.lockBadge}>
                {isPremium ? "Premium active" : "Premium locked"}
              </span>
            </div>
            <p style={styles.generateText}>
              Generate an upgraded version of your resume and a tailored cover letter.
              Both are unlimited with the $10/month subscription.
            </p>
            <div style={styles.generateButtonRow}>
              <button
                type="button"
                style={{
                  ...styles.primaryWideButton,
                  opacity: isGeneratingResume ? 0.7 : 1,
                  cursor: isGeneratingResume ? "not-allowed" : "pointer",
                }}
                onClick={handleGenerateResume}
                disabled={isGeneratingResume}
              >
                {isGeneratingResume ? "Generating resume..." : "Generate upgraded resume"}
              </button>
              <button
                type="button"
                style={{
                  ...styles.secondaryWideButton,
                  opacity: isGeneratingCoverLetter ? 0.7 : 1,
                  cursor: isGeneratingCoverLetter ? "not-allowed" : "pointer",
                }}
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCoverLetter}
              >
                {isGeneratingCoverLetter ? "Generating cover letter..." : "Generate tailored cover letter"}
              </button>
            </div>
          </div>

          {/* Tab switcher and output area */}
          {(generatedResume || generatedCoverLetter) && (
            <div style={styles.premiumOutputSection}>
              <div style={styles.tabRow}>
                <button
                  type="button"
                  style={premiumTab === "resume" ? styles.tabActive : styles.tab}
                  onClick={() => setPremiumTab("resume")}
                >
                  Upgraded Resume
                </button>
                <button
                  type="button"
                  style={premiumTab === "cover" ? styles.tabActive : styles.tab}
                  onClick={() => setPremiumTab("cover")}
                >
                  Cover Letter
                </button>
              </div>

              {/* Resume output */}
              {premiumTab === "resume" && (
                <div style={styles.outputCard}>
                  <div style={styles.outputCardHeader}>
                    <div>
                      <div style={styles.eyebrowSmall}>upgraded resume</div>
                      <h3 style={styles.sectionTitle}>ATS-optimized version</h3>
                      <p style={styles.outputMeta}>
                        Improved bullet language, stronger action verbs, and ATS vocabulary.
                        Your original structure and style are preserved.
                      </p>
                    </div>
                    <div style={styles.outputButtons}>
                      <button
                        type="button"
                        style={styles.smallActionButton}
                        onClick={() => handleCopy(generatedResume)}
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        style={styles.smallActionButton}
                        onClick={() => downloadResumeText(generatedResume, "upgraded_resume.txt")}
                      >
                        Download TXT
                      </button>
                      <button
                        type="button"
                        style={styles.smallActionButton}
                        onClick={handleDownloadResumeDocx}
                      >
                        Download DOCX
                      </button>
                    </div>
                  </div>

                  {missingItems.length > 0 && (
                    <div style={styles.missingItemsBox}>
                      <div style={styles.missingTitle}>
                        Items to add manually before using this resume
                      </div>
                      {missingItems.map((item, i) => (
                        <div key={i} style={styles.missingItem}>
                          <span style={styles.missingField}>{item.field}</span>
                          <span style={styles.missingReason}>{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <pre style={styles.outputPreview}>{generatedResume}</pre>
                </div>
              )}

              {/* Cover letter output */}
              {premiumTab === "cover" && generatedCoverLetter && (
                <div style={styles.outputCard}>
                  <div style={styles.outputCardHeader}>
                    <div>
                      <div style={styles.eyebrowSmall}>tailored cover letter</div>
                      <h3 style={styles.sectionTitle}>Ready to send</h3>
                      <p style={styles.outputMeta}>
                        3-paragraph cover letter tailored to the job description you pasted.
                        Generate a new one for any related job — unlimited.
                      </p>
                    </div>
                    <div style={styles.outputButtons}>
                      <button
                        type="button"
                        style={styles.smallActionButton}
                        onClick={() => handleCopy(buildCoverLetterText(generatedCoverLetter))}
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        style={styles.smallActionButton}
                        onClick={() => downloadCoverLetterText(generatedCoverLetter, "cover_letter.txt")}
                      >
                        Download TXT
                      </button>
                      <button
                        type="button"
                        style={styles.smallActionButton}
                        onClick={() => printCoverLetterPdf(generatedCoverLetter)}
                      >
                        Print / Save PDF
                      </button>
                    </div>
                  </div>

                  <pre style={styles.outputPreview}>
                    {buildCoverLetterText(generatedCoverLetter)}
                  </pre>
                </div>
              )}

              {premiumTab === "cover" && !generatedCoverLetter && (
                <div style={styles.outputCard}>
                  <p style={{ color: "#94a3b8", margin: 0 }}>
                    Paste a job description above and click "Generate tailored cover letter" to create your cover letter.
                  </p>
                </div>
              )}
            </div>
          )}

          {copyNotice && (
            <div style={styles.copyToast}>{copyNotice}</div>
          )}

          <PremiumUpsell
            isPremium={isPremium}
            onUpgrade={handlePremiumUpgrade}
            title="Get the upgraded resume + tailored cover letter"
            subtitle={
              isPremium
                ? "Premium is active. Generate your upgraded resume and unlimited cover letters above."
                : "A $10/month subscription unlocks an upgraded version of your resume plus unlimited tailored cover letters for any job you apply to."
            }
            priceText="$10/month"
            buttonText="Unlock Premium"
          />
        </div>
      ) : null}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode="login"
        onAuthSuccess={() => {
          setCurrentUser(getCurrentUser());
          setAuthOpen(false);
          setPremiumMessage("Signed in. Go to the main hub to unlock premium, then come back here.");
        }}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(30,41,59,0.65) 0%, rgba(2,6,23,1) 45%, rgba(2,6,23,1) 100%)",
    padding: "32px 20px 60px 20px",
    color: "#f8fafc",
  },
  hero: {
    maxWidth: "1100px",
    margin: "0 auto 24px auto",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(99, 102, 241, 0.12)",
    color: "#c7d2fe",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "14px",
  },
  topPremiumWrap: {
  maxWidth: "1100px",
  margin: "0 auto 24px auto",
},
  heroTitle: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1.02,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  heroSubtitle: {
    margin: "14px 0 0 0",
    fontSize: "17px",
    lineHeight: 1.7,
    color: "#cbd5e1",
    maxWidth: "820px",
  },
  panel: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(148,163,184,0.14)",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.26)",
  },
  controlsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  controlCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: "20px",
    padding: "16px",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  uploadBox: {
    display: "block",
    borderRadius: "16px",
    border: "1px dashed rgba(148,163,184,0.28)",
    background: "rgba(255,255,255,0.02)",
    padding: "18px",
    cursor: "pointer",
  },
  uploadTitle: {
    display: "block",
    fontSize: "15px",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "6px",
  },
  uploadSubtext: {
    display: "block",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  select: {
    width: "100%",
    height: "48px",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.72)",
    color: "#f8fafc",
    padding: "0 14px",
    fontSize: "15px",
    outline: "none",
  },
  textAreaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  textBlock: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: "20px",
    padding: "16px",
  },
  textarea: {
    width: "100%",
    minHeight: "240px",
    resize: "vertical",
    borderRadius: "16px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.72)",
    color: "#f8fafc",
    padding: "14px",
    fontSize: "14px",
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
  },
  lockedBox: {
    minHeight: "240px",
    borderRadius: "16px",
    border: "1px dashed rgba(251,191,36,0.28)",
    background: "rgba(251,191,36,0.06)",
    color: "#fde68a",
    padding: "16px",
    fontSize: "14px",
    lineHeight: 1.7,
    boxSizing: "border-box",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "4px",
  },
  primaryButton: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 20px",
    fontSize: "15px",
    fontWeight: 800,
    background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(37,99,235,0.24)",
  },
  error: {
    marginBottom: "14px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  notice: {
    marginBottom: "14px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.28)",
    color: "#bfdbfe",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  results: {
    maxWidth: "1100px",
    margin: "26px auto 0 auto",
  },
  deepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
    marginTop: "24px",
    marginBottom: "26px",
  },
  dashboardCard: {
    borderRadius: "22px",
    padding: "18px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.25,
    fontWeight: 800,
    color: "#f8fafc",
    marginBottom: "14px",
  },
  scoreBarStack: {
    display: "grid",
    gap: "14px",
  },
  scoreBarRow: {
    display: "grid",
    gap: "8px",
  },
  scoreBarTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "15px",
    color: "#e2e8f0",
  },
  scoreBarTrack: {
    width: "100%",
    height: "8px",
    borderRadius: "999px",
    background: "rgba(148,163,184,0.18)",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#6366f1",
  },
  scoreBarNote: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#94a3b8",
  },
  statCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "14px",
  },
  statCard: {
    borderRadius: "18px",
    padding: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  statLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: "10px",
  },
  statValue: {
    display: "block",
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 900,
    color: "#f8fafc",
    marginBottom: "10px",
  },
  statText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#cbd5e1",
  },
  stackGap: {
    display: "grid",
    gap: "12px",
  },
  noteBlue: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#dbeafe",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  note: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.12)",
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  noteSuccess: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#bbf7d0",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  noteWarning: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.20)",
    color: "#fde68a",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  checkRow: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.12)",
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: 1.6,
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
  },
  nextSection: {
    borderRadius: "22px",
    padding: "18px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
    marginBottom: "26px",
  },
  premiumInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
    marginBottom: "20px",
  },
  premiumOutputGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 0.9fr) minmax(320px, 1fr) minmax(320px, 1fr)",
    gap: "18px",
    marginBottom: "24px",
  },
  premiumGenerateCard: {
    borderRadius: "22px",
    padding: "18px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
  },
  premiumOutputCard: {
    borderRadius: "22px",
    padding: "18px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
  },
  eyebrowSmall: {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#818cf8",
    marginBottom: "10px",
  },
  premiumLockedRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "14px",
  },
  generateTitle: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.35,
    fontWeight: 800,
    color: "#f8fafc",
  },
  lockBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(99,102,241,0.10)",
    border: "1px solid rgba(99,102,241,0.20)",
    color: "#c7d2fe",
    fontSize: "12px",
    fontWeight: 800,
  },
  generateText: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#cbd5e1",
  },
  primaryWideButton: {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    background: "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)",
    color: "#ffffff",
    marginBottom: "12px",
  },
  secondaryWideButton: {
    width: "100%",
    borderRadius: "16px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    background: "transparent",
    color: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.22)",
    marginBottom: "14px",
  },
  variantRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  pill: {
    padding: "9px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
    border: "1px solid rgba(148,163,184,0.18)",
  },
  pillDefault: {
    background: "rgba(99,102,241,0.10)",
    color: "#c7d2fe",
  },
  pillSuccess: {
    background: "rgba(34,197,94,0.10)",
    color: "#bbf7d0",
  },
  pillWarning: {
    background: "rgba(245,158,11,0.10)",
    color: "#fde68a",
  },
  targetingCard: {
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(255,255,255,0.02)",
  },
  targetingTitle: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: 800,
    color: "#f8fafc",
  },
  targetingLocked: {
    borderRadius: "14px",
    padding: "14px",
    border: "1px dashed rgba(148,163,184,0.22)",
    background: "rgba(255,255,255,0.03)",
    color: "#cbd5e1",
    marginBottom: "12px",
    lineHeight: 1.6,
  },
  targetingText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#94a3b8",
  },
  outputButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  smallActionButton: {
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    background: "transparent",
    color: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.22)",
  },
  outputPreview: {
    minHeight: "320px",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(255,255,255,0.02)",
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.75,
  },
  bulletList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#e2e8f0",
    lineHeight: 1.8,
  },
  numberList: {
    margin: 0,
    paddingLeft: "22px",
    color: "#e2e8f0",
    lineHeight: 1.8,
  },
  // New premium section styles
  premiumTag: {
    display: "inline-flex",
    alignItems: "center",
    marginLeft: "8px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "rgba(251,191,36,0.15)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fde68a",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    verticalAlign: "middle",
  },
  unlockButton: {
    border: "none",
    borderRadius: "14px",
    padding: "12px 18px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#1c1410",
  },
  premiumGenerateRow: {
    borderRadius: "22px",
    padding: "20px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(99,102,241,0.22)",
    marginBottom: "20px",
  },
  generateButtonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  lockBadgeActive: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#86efac",
    fontSize: "12px",
    fontWeight: 800,
  },
  premiumOutputSection: {
    marginBottom: "24px",
  },
  tabRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
  },
  tab: {
    border: "1px solid rgba(148,163,184,0.20)",
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    background: "transparent",
    color: "#94a3b8",
  },
  tabActive: {
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: "12px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    background: "rgba(99,102,241,0.14)",
    color: "#c7d2fe",
  },
  outputCard: {
    borderRadius: "22px",
    padding: "20px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
  },
  outputCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  outputMeta: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#94a3b8",
  },
  missingItemsBox: {
    borderRadius: "16px",
    padding: "16px",
    background: "rgba(245,158,11,0.07)",
    border: "1px solid rgba(245,158,11,0.22)",
    marginBottom: "16px",
  },
  missingTitle: {
    fontSize: "13px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#fde68a",
    marginBottom: "12px",
  },
  missingItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginBottom: "10px",
  },
  missingField: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#fbbf24",
  },
  missingReason: {
    fontSize: "13px",
    color: "#fde68a",
    lineHeight: 1.55,
    opacity: 0.85,
  },
  outputPreview: {
    margin: 0,
    minHeight: "320px",
    maxHeight: "600px",
    overflowY: "auto",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(255,255,255,0.02)",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  copyToast: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    padding: "12px 18px",
    borderRadius: "14px",
    background: "#1e293b",
    border: "1px solid rgba(148,163,184,0.22)",
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
    zIndex: 999,
    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
  },
};