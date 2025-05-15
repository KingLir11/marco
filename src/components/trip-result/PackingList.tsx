
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Backpack } from "lucide-react";

interface EquipmentItem {
  name: string;
  icon: JSX.Element;
}

interface PackingListProps {
  equipment: EquipmentItem[];
}

const PackingList = ({ equipment }: PackingListProps) => {
  if (equipment.length === 0) return null;

  return (
    <Card className="mb-10 border border-white/20 shadow-lg">
      <CardHeader className="bg-green-50 border-b">
        <div className="flex items-center">
          <Backpack className="h-6 w-6 text-green-600 mr-2" />
          <CardTitle className="text-green-600">Packing List</CardTitle>
        </div>
        <CardDescription>Recommended equipment for your trip</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Item</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="bg-primary/10 p-2 rounded-full">
                    {item.icon}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PackingList;
