import { marshall } from "@aws-sdk/util-dynamodb";
import { Task, Project } from "./types";

type Entity = Task | Project;  // Updated to include both Task and Project

export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
};
