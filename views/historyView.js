import { requireAuth } from "../services/auth-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}
