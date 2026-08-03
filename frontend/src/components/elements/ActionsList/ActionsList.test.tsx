import { fireEvent, render, screen } from '@testing-library/react';
import ActionsList from './ActionsList';

describe('ActionsList', () => {
  it('renders backend groups without creating subgroups', () => {
    const handleActionClick = vi.fn();
    const groups = [{
      key: 'DEFENSIVE_ORGANIZATION',
      title: 'Organização defensiva',
      order: 1,
      actions: [{
        id: 'action-mbrp',
        key: 'MBRP',
        name: 'Recuperação de bola em marcação baixa',
        impact: 'POSITIVE' as const,
        order: 1,
      }],
    }];

    render(<ActionsList groups={groups} handleActionClick={handleActionClick}/>);

    expect(screen.getByText('Organização defensiva')).toBeInTheDocument();
    expect(screen.queryByText('Marcação baixa')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Recuperação de bola/ }));
    expect(handleActionClick).toHaveBeenCalledWith(groups[0].actions[0], 'Organização defensiva');
  });

  it('renders every action received from the backend catalog', () => {
    const actions = Array.from({ length: 35 }, (_, index) => ({
      id: 'action-' + index,
      key: 'A' + index,
      name: 'Ação coletiva ' + (index + 1),
      impact: index % 2 === 0 ? 'POSITIVE' as const : 'NEGATIVE' as const,
      order: index + 1,
    }));
    render(<ActionsList
      groups={[{
        key: 'TEAM_GROUP',
        title: 'Ações coletivas',
        order: 1,
        actions,
      }]}
      handleActionClick={vi.fn()}
    />);

    expect(screen.getAllByRole('button')).toHaveLength(35);
    expect(screen.getByText('Ação coletiva 35')).toBeInTheDocument();
  });
});
