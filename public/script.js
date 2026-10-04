document.querySelectorAll("[data-demo-login]").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector(
      'input[type="email"], input[data-credential="email"]',
    );
    const passwordInput = form.querySelector('input[type="password"]');
    const message = form.querySelector(".login-error");
    const button = form.querySelector(".login-submit");

    const email = emailInput?.value.trim() ?? "";
    const password = passwordInput?.value ?? "";
    const role = form.getAttribute("data-role");

    if (!email || !password) {
      message.textContent = "Please enter your email and password.";
      message.classList.add("show");
      return;
    }

    if (!window.bwuFirebase) {
      message.textContent = "Firebase is not available. Please try again.";
      message.classList.add("show");
      return;
    }

    button.disabled = true;
    button.classList.add("loading");
    message.classList.remove("show");

    try {
      const {
        auth,
        db,
        signInWithEmailAndPassword,
        signOut,
        doc,
        getDoc,
      } = window.bwuFirebase;

      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = credential.user;
      console.log("Firebase UID:", user.uid);
console.log("Firebase email:", user.email);

      const profileSnapshot = await getDoc(
        doc(db, "Users", user.uid),
      );
      console.log(
  "Firebase project:",
  db.app.options.projectId,
);
      console.log("Profile path:", `users/${user.uid}`);
      console.log("Profile exists:", profileSnapshot.exists());
      console.log("Profile data:", profileSnapshot.data());

      if (!profileSnapshot.exists()) {
        await signOut(auth);

        throw new Error(
          "Your Firebase account exists, but your academic profile has not been created.",
        );
      }

      const profile = profileSnapshot.data();

      if (profile.role !== role?.toUpperCase()) {
        await signOut(auth);

        throw new Error(
          `This account is not registered as a ${role} account.`,
        );
      }

      if (profile.isActive === false) {
        await signOut(auth);

        throw new Error(
          "Your account is currently inactive. Please contact the administrator.",
        );
      }

      message.classList.remove("show");

      const targets = {
        student: "student-dashboard.html",
        faculty: "faculty-dashboard.html",
        admin: "admin-dashboard.html",
      };

      window.location.href = targets[role] || "index.html";
    } catch (error) {
      console.error("Firebase login error:", error);

      let errorMessage =
        "Unable to sign in. Please check your credentials and try again.";

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "auth/invalid-credential"
      ) {
        errorMessage = "Incorrect email or password.";
      } else if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "auth/user-disabled"
      ) {
        errorMessage = "This account has been disabled.";
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      message.textContent = errorMessage;
      message.classList.add("show");
    } finally {
      button.disabled = false;
      button.classList.remove("loading");
    }
  });
});
// Home-page background video: adding the video file automatically activates playback.
const hero=document.querySelector(".hero");
const heroVideo=document.querySelector(".hero-video");
if(hero && heroVideo){
  const activate=()=>{
    if(heroVideo.currentSrc || heroVideo.querySelector("source")?.getAttribute("src")){
      hero.classList.add("has-video");
      heroVideo.play().catch(()=>{});
    }
  };
  heroVideo.addEventListener("loadeddata",activate);
  activate();
}
