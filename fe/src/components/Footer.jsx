// src/components/Footer.jsx
import { Layout, Typography } from "antd";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
  return (
    <AntFooter style={{ textAlign: "center" }}>
      <Text>© 2025 Perfume Store. All rights reserved.</Text>
    </AntFooter>
  );
}
