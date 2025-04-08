import { Link as RouterLink } from "react-router-dom";
import { Box, Container, AppBar, Typography, Toolbar } from "@mui/material";

import logo from "../assets/images/VICTUS1b.png";
import qrCode from "../assets/images/formQrCode.svg";

export function NavbarVicuts() {
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#fff" }}>
        <Toolbar>
          <Container
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <Box component={RouterLink} to="/" sx={{ p: 1 }}>
              <img
                alt="Victus Logo"
                src={logo}
                width="200"
                height="50"
                style={{ verticalAlign: "top" }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box
              component="a"
              href="https://forms.gle/Z3hnWQDT6F3o1Vi76"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Typography
                sx={{
                  textAlign: "center",
                  mr: 2,
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                Avalie o Victus Charts:
              </Typography>
              <img
                src={qrCode}
                width="80"
                height="80"
                style={{ verticalAlign: "middle" }}
                alt="QR Code para avaliação"
              />
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
    </>
  );
}
