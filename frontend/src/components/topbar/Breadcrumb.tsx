import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useParams } from "react-router";

function resolveCommuneLabel(commune?: string | null) {
  if (!commune) {
    return null;
  }
  const parts = commune.split("-");
  const cityName = parts[0][0].toUpperCase() + parts[0].slice(1);
  return cityName + " " + parts[1];
}

export default function BreadcrumbComponent() {
  const { commune, section } = useParams();

  const communeLabel = resolveCommuneLabel(commune);

  if (!communeLabel) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Paris</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const communePath = commune ? `/${commune}` : "/";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Paris</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {section ? (
            <BreadcrumbLink asChild>
              <Link to={communePath}>{communeLabel}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{communeLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {section ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{`Section ${section}`}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
