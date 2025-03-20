import { marshall } from "@aws-sdk/util-dynamodb";
import { Task } from "./types";

type Entity = Task;  // UPDATED to Task

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
