import { getAuth } from "firebase/auth";

import { firebaseApp } from "#src/firebase/client";

export const auth = getAuth(firebaseApp);
