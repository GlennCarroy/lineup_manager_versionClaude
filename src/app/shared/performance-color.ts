// Couleur d'une barre de progression selon sa valeur, de 0 à 100
export function performanceClass(percent: number): string {
  if (percent < 25) {
    return 'bg-red-600';
  }
  if (percent < 50) {
    return 'bg-orange-500';
  }
  if (percent < 75) {
    return 'bg-blue-500';
  }
  return 'bg-emerald-500';
}
