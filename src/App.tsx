import "./App.css";
import { SetStateAction, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";

function App() {
  const [seats, setSeats] = useState([16]);
  const [votes, addVotes] = useState<AddVotesSchema[]>([]);
  const [winningParties, setWinningParties] = useState<string[]>([]);
  const [calculatedSeats, setCalculatedSeats] = useState<{
    [key: string]: number;
  }>({});

  const handleSliderChange = (value: SetStateAction<number[]>) => {
    setSeats(value);
  };

  const addVotesSchema = z.object({
    name: z.string(),
    votes: z.coerce.number(),
  });

  type AddVotesSchema = z.infer<typeof addVotesSchema>;

  const { register, handleSubmit } = useForm<AddVotesSchema>({
    resolver: zodResolver(addVotesSchema),
  });

  const calculateSeats = () => {
    const votesCopy = [...votes];
    const seatsByParty: { [key: string]: number } = {};
    const winningParties: string[] = [];

    votesCopy.forEach((vote) => {
      seatsByParty[vote.name] = 0;
    });

    const totalSeats = seats[0];

    for (let i = 0; i < totalSeats; i++) {
      let greatestDivision = -1;
      let winnerParty = "";

      votesCopy.forEach((vote) => {
        const division = vote.votes / (seatsByParty[vote.name] + 1);
        if (division > greatestDivision) {
          greatestDivision = division;
          winnerParty = vote.name;
        }
      });

      seatsByParty[winnerParty]++;
      winningParties.push(winnerParty);
    }

    setWinningParties(winningParties);

    return seatsByParty;
  };

  const handleAddVotes = (data: AddVotesSchema) => {
    addVotes([...votes, data]);
  };

  useEffect(() => {
    setCalculatedSeats(calculateSeats());
  }, [votes, seats]);

  const renderSeats = () => {
    let newSeats = [];
    const totalSeats = seats[0];

    for (let i = 0; i < totalSeats; i++) {
      let party = "";
      if (winningParties[i]) {
        party = winningParties[i];
      }

      newSeats.push(
        <div
          key={`${party} - ${i}`}
          className="flex justify-center border rounded-md p-2"
        >
          {party ? party : <UserRound />}
        </div>
      );
    }

    return newSeats;
  };

  return (
    <>
      <div className="min-h-screen min-w-screen flex justify-center items-center">
        <div className="w-3/4 md:w-7/12 flex flex-col space-y-4 h-screen justify-center">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              Contagem do Congresso
            </h3>
          </div>

          <div className="w-full h-3/4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <ScrollArea className="border rounded-md w-full md:w-2/3 p-4 h-2/5 md:h-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {renderSeats()}
              </div>
            </ScrollArea>

            <ScrollArea className="border rounded-md w-full md:w-1/3 h-3/5 md:h-auto">
              <div className="p-4 space-y-4">
                <div className="border rounded-md p-4">
                  <p className="font-semibold tracking-tight">Cadeiras</p>
                  <Slider
                    id="slider"
                    defaultValue={[16]}
                    max={60}
                    step={1}
                    onValueChange={handleSliderChange}
                  />
                </div>
                {votes.map((vote) => (
                  <div className="border rounded-md p-4">
                    <p className="font-semibold tracking-tight">{vote.name}</p>
                    <p className="font-normal tracking-tight">
                      {vote.votes} votos
                    </p>
                    <p className="font-normal tracking-tight">
                      {calculatedSeats[vote.name]} cadeiras
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-row-reverse">
            <Dialog>
              <DialogTrigger>
                <Button>Adicionar votos</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar votos</DialogTitle>
                </DialogHeader>

                <form
                  className="space-y-4"
                  id="votes"
                  onSubmit={handleSubmit(handleAddVotes)}
                >
                  <div>
                    <p className="font-semibold tracking-tight">Nome</p>
                    <Input id="name" {...register("name")} />
                  </div>

                  <div>
                    <p className="font-semibold tracking-tight">Votos</p>
                    <Input id="votes" {...register("votes")} />
                  </div>

                  <DialogFooter>
                    <DialogClose>
                      <Button form="votes" type="submit">
                        Adicionar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
